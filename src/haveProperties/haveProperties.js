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

const defaultCreatePropertyValueMatcher = (propertyValue, propertyName, recurse) => {
	if (canHaveProperties(propertyValue)) {
		return recurse(propertyValue, propertyName)
	}
	return strictEqual(propertyValue)
}

const createPropertyMismatchFailureMessage = (path, propertyName, message) => {
	if (message.includes(" mismatch:")) {
		return message
	}
	return `${[...path, propertyName]} mismatch: ${message}`
}

const createPropertyMissingFailureMessage = (path, propertyName) => {
	return `missing ${propertyName} property`
}

const createPropertyExtraFailureMessage = (path, propertyName) => {
	return `unexpected ${propertyName} property`
}

const compareProperties = (
	actual,
	expected,
	{
		allowExtra = false,
		extraMustBeEnumerable = true,
		createPropertyValueMatcher = defaultCreatePropertyValueMatcher,
		expectedSeen,
		actualSeen,
		path,
	},
) => {
	if (actual === null || actual === undefined) {
		return failed(`cannot compare properties of ${actual}: it has no properties`)
	}

	return any([matchAny(Object)(actual), matchAny(Function)(actual)]).then(
		() => {
			if (actualSeen && actualSeen.includes(actual)) {
				if (expectedSeen.includes(expected)) {
					return passed()
				}
				return failed(`unexpected circular reference`)
			}
			if (expectedSeen && expectedSeen.includes(expected)) {
				if (actualSeen.includes(actual)) {
					return passed()
				}
				return failed(`missing a circular reference`)
			}

			if (actualSeen) {
				actualSeen.push(actual)
			} else {
				actualSeen = [actual]
			}
			if (expectedSeen) {
				expectedSeen.push(expected)
			} else {
				expectedSeen = [expected]
			}

			path = path || []

			const listNames = value => {
				const names = Object.getOwnPropertyNames(value)
				return names
			}

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)
			const propertyExpectations = []

			// dans le cas où on recurse on voudrait pas modifier le message d'erreur
			// autrement dit si la failure provient d'un matcher qui est nested
			// on ne le préfixe pas
			// sauf que la seule chose que j'ai c'est une string comme raison de la failure
			// "value foo.bar mismatch: expect a number but got a boolean : true"
			const recurse = (expectedPropertyValue, propertyName) => actualPropertyValue =>
				compareProperties(actualPropertyValue, expectedPropertyValue, {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
					expectedSeen,
					actualSeen,
					path: [...path, propertyName],
				})

			expectedPropertyNames.forEach(name => {
				if (actualPropertyNames.includes(name)) {
					const expectedPropertyValue = expected[name]
					let propertyMatcher
					if (isMatcher(expectedPropertyValue)) {
						propertyMatcher = expectedPropertyValue
					} else {
						propertyMatcher = createPropertyValueMatcher(expectedPropertyValue, name, recurse)
					}
					propertyExpectations.push(
						propertyMatcher(actual[name]).then(null, failure => {
							return createPropertyMismatchFailureMessage(path, name, failure)
						}),
					)
				} else {
					propertyExpectations.push(failed(createPropertyMissingFailureMessage(path, name)))
				}
			})

			if (allowExtra === false) {
				actualPropertyNames.forEach(name => {
					if (expectedPropertyNames.includes(name) === false) {
						if (
							extraMustBeEnumerable === false ||
							Object.getOwnPropertyDescriptor(actual, name).enumerable === true
						) {
							propertyExpectations.push(failed(createPropertyExtraFailureMessage(path, name)))
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
