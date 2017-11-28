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

const defaultCreatePropertyValueMatcher = (propertyTrace, recurse) => {
	const expectedPropertyValue = propertyTrace.getExpected()
	if (canHaveProperties(expectedPropertyValue)) {
		return recurse(propertyTrace)
	}
	return strictEqual(expectedPropertyValue)
}

const getValueNameFromTrace = trace => {
	const { getName, getParentTrace } = trace
	const valueName = getName()
	const parentTrace = getParentTrace()
	if (parentTrace === null) {
		// I want to improve failure message event more could improve log even more by transforming
		// "expect value 0 to be an object"
		// into
		// "expect anonymous spy first call first argument to be an object"
		// thanks to this trace api and maybe a bit more work I'll be able to do that
		// I must first end the other apis, especially the ones around spy
		// to see more clearly how we can transform "0" into "first argument"
		return valueName
	}
	return `${getValueNameFromTrace(parentTrace)} ${valueName}`
}

const createPropertiesFailureMessage = ({ type, trace, data }) => {
	if (type === "extra-recursion") {
		return `expect ${getValueNameFromTrace(trace)} to be ${prefixValue(
			trace.getExpected(),
		)} but got a circular reference`
	}
	if (type === "missing-recursion") {
		return `expect ${getValueNameFromTrace(trace)} to be a circular reference but got ${prefixValue(
			trace.getActual(),
		)}`
	}
	if (type === "extra") {
		return `unexpected ${trace.getName()} property on ${getValueNameFromTrace(
			trace.getParentTrace(),
		)}`
	}
	if (type === "missing") {
		return `expect ${trace.getName()} property on ${getValueNameFromTrace(
			trace.getParentTrace(),
		)} but missing`
	}
	if (type === "mismatch") {
		return `${getValueNameFromTrace(trace)} mismatch: ${data}`
	}
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
		trace,
	},
) => {
	if (actual === null || actual === undefined) {
		return failed(`cannot compare properties of ${actual}: it has no properties`)
	}

	return any([matchObject(actual), matchFunction(actual)]).then(
		() => {
			if (trace === undefined) {
				trace = {
					getDepth: () => 0,
					getName: () => "value",
					getExpected: () => expected,
					getActual: () => actual,
					getParentTrace: () => null,
				}
			}

			const depth = trace.getDepth()

			if (depth === 0) {
				actualSeen = [actual]
				expectedSeen = [expected]
			} else {
				if (actualSeen.includes(actual)) {
					if (expectedSeen.includes(expected)) {
						return passed()
					}
					if (allowExtra) {
						return passed()
					}
					if (
						extraMustBeEnumerable &&
						propertyIsEnumerable(trace.getParentTrace().getActual(), trace.getName()) === false
					) {
						return passed()
					}
					return failed({
						type: "extra-recursion",
						trace,
					})
				}
				if (expectedSeen.includes(expected)) {
					if (actualSeen.includes(actual)) {
						return passed()
					}
					return failed({
						type: "missing-recursion",
						trace,
					})
				}

				actualSeen.push(actual)
				expectedSeen.push(expected)
			}

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)

			const createTraceForProperty = name => {
				const getDepth = () => depth + 1
				const getName = () => name
				const getExpected = () => expected[name]
				const getActual = () => actual[name]
				const getParentTrace = () => trace

				return {
					getDepth,
					getName,
					getExpected,
					getActual,
					getParentTrace,
				}
			}
			const recurse = propertyTrace => () => {
				return compareProperties(propertyTrace.getActual(), propertyTrace.getExpected(), {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
					expectedSeen,
					actualSeen,
					trace: propertyTrace,
				})
			}

			return chainFunctions(
				() => {
					return sequence(expectedPropertyNames, name => {
						const propertyTrace = createTraceForProperty(name)

						if (actualPropertyNames.includes(name) === false) {
							return failed({
								type: "missing",
								trace: propertyTrace,
							})
						}

						const expectedPropertyValue = propertyTrace.getExpected()

						let propertyMatcher
						if (isMatcher(expectedPropertyValue)) {
							propertyMatcher = expectedPropertyValue
						} else {
							propertyMatcher = createPropertyValueMatcher(propertyTrace, recurse)
						}

						return propertyMatcher(propertyTrace.getActual()).then(null, failure => {
							if (typeof failure === "string") {
								return {
									type: "mismatch",
									data: failure,
									trace: propertyTrace,
								}
							}
							return failure
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
						const propertyTrace = createTraceForProperty(name)
						return failed({
							type: "extra",
							trace: propertyTrace,
						})
					})
				},
			).then(
				() => undefined,
				failure => {
					if (depth === 0) {
						return createPropertiesFailureMessage(failure)
					}
					return failure
				},
			)
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
			`${name} first argument must be able to hold properties but it was called with
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
