import { isMatcher, createMatcher } from "../match.js"
import { passed, failed, all, any } from "@dmail/action"
import { any as matchAny, prefixValue } from "../any/any.js"
import { strictEqual } from "../strictEqual/strictEqual.js"
import { uneval } from "@dmail/uneval"

// if you want to prevent the recursion behaviour on an object/function
// you can specify a matcher for the value and it will just use the matcher
/*
{
	array: strictEqual(array)
}
*/

export const canHaveProperties = value => {
	if (value === null) {
		return false
	}
	return typeof value === "object" || typeof value === "function"
}

const defaultCreatePropertyValueMatcher = (propertyValue, recurse) => {
	if (canHaveProperties(propertyValue)) {
		return () => recurse(propertyValue)
	}
	return strictEqual(propertyValue)
}

const compareProperties = (
	actual,
	expected,
	{
		allowExtra = false,
		extraMustBeEnumerable = true,
		createPropertyValueMatcher = defaultCreatePropertyValueMatcher,
		seen,
	},
) => {
	if (actual === null || actual === undefined) {
		return failed(`cannot compare properties of ${actual}: it has no properties`)
	}

	return any([matchAny(Object)(actual), matchAny(Function)(actual)]).then(
		() => {
			if (seen) {
				if (seen.includes(expected)) {
					return passed()
				}
				seen.push(expected)
			} else {
				seen = [expected]
			}

			const listNames = value => {
				const names = Object.getOwnPropertyNames(value)
				// if (typeof value === "function") {
				// 	return names.filter(
				// 		name =>
				// 			name !== "length" &&
				// 			name !== "name" &&
				// 			name !== "arguments" &&
				// 			name !== "caller" &&
				// 			name !== "prototype",
				// 	)
				// }
				return names
			}

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)
			const propertyExpectations = []

			const recurse = propertyValue => {
				return compareProperties(propertyValue, {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
					seen,
				})
			}

			expectedPropertyNames.forEach(name => {
				if (actualPropertyNames.includes(name)) {
					const expectedPropertyValue = expected[name]
					let propertyMatcher
					if (isMatcher(expectedPropertyValue)) {
						propertyMatcher = expectedPropertyValue
					} else {
						propertyMatcher = createPropertyValueMatcher(expectedPropertyValue, recurse)
					}
					propertyExpectations.push(
						propertyMatcher()(actual[name]).then(
							null,
							message => `${name} property mismatch: ${message}`,
						),
					)
				} else {
					propertyExpectations.push(failed(`missing ${name} property`))
				}
			})

			if (allowExtra === false) {
				actualPropertyNames.forEach(name => {
					if (expectedPropertyNames.includes(name) === false) {
						if (
							extraMustBeEnumerable === false ||
							Object.getOwnPropertyDescriptor(actual, name).enumerable === true
						) {
							propertyExpectations.push(failed(`unexpected ${name} property`))
						}
					}
				})
			}

			return all(propertyExpectations)
		},
		() => failed(`cannot compare properties of ${prefixValue(actual)}: ${uneval(actual)}`),
	)
}

export const haveProperties = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: false }))

export const havePropertiesAllowingExtra = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: true }))

export const havePropertiesIncludingHidden = expected =>
	createMatcher(actual => compareProperties(actual, expected, { extraMustBeEnumerable: false }))
