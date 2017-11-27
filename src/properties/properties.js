import { isMatcher, createMatcher } from "../matcher.js"
import { passed, failed, sequence, chainFunctions, any } from "@dmail/action"
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
	Object.prototype.propertyIsEnumerable.call(object, name)

const matchObject = matchAny(Object)
const matchFunction = matchAny(Function)
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
		actualOwner,
	},
) => {
	if (actual === null || actual === undefined) {
		return failed(`cannot compare properties of ${actual}: it has no properties`)
	}

	return any([matchObject(actual), matchFunction(actual)]).then(
		() => {
			if (actualSeen && actualSeen.includes(actual)) {
				if (expectedSeen.includes(expected)) {
					return passed()
				}
				if (allowExtra) {
					return passed()
				}
				if (
					extraMustBeEnumerable &&
					propertyIsEnumerable(actualOwner, path[path.length - 1]) === false
				) {
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

			const recurse = (expectedPropertyValue, propertyName) => actualPropertyValue =>
				compareProperties(actualPropertyValue, expectedPropertyValue, {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
					expectedSeen,
					actualSeen,
					path: [...path, propertyName],
					actualOwner: actual,
				})

			return chainFunctions(
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
						if (extraMustBeEnumerable && propertyIsEnumerable(actual, name) === false) {
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

const oneParamWhichCanHavePropertiesSignature = (fn, name) => (...args) => {
	if (args.length !== 1) {
		throw new Error(`${name} must be called with one argument, got ${args.length}`)
	}
	const [expected] = args
	if (canHaveProperties(expected) === false) {
		throw new TypeError(
			`${name} expect first argument to be able to hold properties but was called with
${uneval(expected)}
You can use an object, array or function for instance`,
		)
	}
	return fn(expected)
}

export const propertiesMatching = oneParamWhichCanHavePropertiesSignature(
	expected =>
		createMatcher(actual =>
			compareProperties(actual, expected, {
				allowExtra: true,
				extraMustBeEnumerable: true, // not needed when allowExtra is true
			}),
		),
	"propertiesMatching",
)

export const strictPropertiesMatching = oneParamWhichCanHavePropertiesSignature(
	expected =>
		createMatcher(actual =>
			compareProperties(actual, expected, {
				allowExtra: false,
				extraMustBeEnumerable: true,
			}),
		),
	"strictPropertiesMatching",
)

// add propertiesMatchingIncludingHidden
// add strictPropertiesMatchingIncludingHidden
