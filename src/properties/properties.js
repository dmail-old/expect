import { isMatcher, createMatcher } from "../matcher.js"
import { passed, failed, sequence, chainActions, any } from "@dmail/action"
import { any as matchAny, prefixValue } from "../any/any.js"
import { strictEqual } from "../strictEqual/strictEqual.js"
import { uneval } from "@dmail/uneval"

// if you want to prevent the recursion behaviour on an object/function
// you can specify a matcher for the value and it will use the matcher
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

const listNames = value => Object.getOwnPropertyNames(value)

const propertyIsEnumerable = (object, name) =>
	Object.getOwnPropertyDescriptor(object, name).enumerable

const compareProperties = (
	actual,
	expected,
	{
		allowExtra,
		extraMustBeEnumerable,
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

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)

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

			return chainActions(
				() => {
					return sequence(expectedPropertyNames, name => {
						if (actualPropertyNames.includes(name) === false) {
							return failed(createPropertyMissingFailureMessage(path, name))
						}

						const expectedPropertyValue = expected[name]
						let propertyMatcher
						if (isMatcher(expectedPropertyValue)) {
							propertyMatcher = expectedPropertyValue
						} else {
							propertyMatcher = createPropertyValueMatcher(expectedPropertyValue, name, recurse)
						}

						return propertyMatcher(actual[name]).then(null, failure => {
							return createPropertyMismatchFailureMessage(path, name, failure)
						})
					})
				},
				() => {
					if (allowExtra) {
						return passed()
					}
					return sequence(actualPropertyNames, name => {
						if (expectedPropertyNames.includes(name)) {
							return passed()
						}
						if (extraMustBeEnumerable || propertyIsEnumerable(actual, name) === false) {
							return passed()
						}
						return failed(createPropertyExtraFailureMessage(path, name))
					})
				},
			).then(() => undefined)
		},
		() => failed(`cannot compare properties of ${prefixValue(actual)}: ${uneval(actual)}`),
	)
}

export const propertiesMatching = expected =>
	createMatcher(actual =>
		compareProperties(actual, expected, {
			allowExtra: true,
			extraMustBeEnumerable: true, // not needed when allowExtra is true
		}),
	)

export const strictPropertiesMatching = expected =>
	createMatcher(actual =>
		compareProperties(actual, expected, {
			allowExtra: false,
			extraMustBeEnumerable: true,
		}),
	)

export const strictPropertiesMatchingIncludingHidden = expected =>
	createMatcher(actual =>
		compareProperties(actual, expected, {
			allowExtra: false,
			extraMustBeEnumerable: false,
		}),
	)
