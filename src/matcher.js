import { hasProperty } from "./helper.js"
import { isTrace, createNamedTrace } from "./trace/trace.js"
import { createAction, fromFunction, isAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const getValueNameFromTrace = ({ getName, getParentTrace }) => {
	const name = getName()
	const parentTrace = getParentTrace()
	if (parentTrace === null) {
		// I want to improve failure message event more could improve log even more by transforming
		// "expect value 0 to be an object"
		// into
		// "expect anonymous spy first call first argument to be an object"
		// thanks to this trace api and maybe a bit more work I'll be able to do that
		// I must first end the other apis, especially the ones around spy
		// to see more clearly how we can transform "0" into "first argument"
		return name
	}
	// we do String(valueName) in case valueName is a symbol
	// to avoid Cannot convert a Symbol value to a string error
	return `${getValueNameFromTrace(parentTrace)} ${String(name)}`
}

export const createFailureMessage = ({ type, trace, expected, actual }) => {
	if (type === "unexpected-resolved-value") {
		return `expect ${getValueNameFromTrace(
			trace.getParentTrace(),
		)} to reject but it resolved with ${uneval(actual)}`
	}
	return `expect ${getValueNameFromTrace(trace)} to match ${uneval(expected)}`
}

const matchSymbol = Symbol()

export const isMatcher = value => hasProperty(value, matchSymbol)

const defaultCreateSignatureMessage = ({ name, type, args }) => {
	if (type === "missing") {
		return `${name} must be called with one argument but was called without. You can use ${
			name
		}(any())`
	}
	return `${name} must be called with one argument but was called with ${args.length}`
}

export const createMatcher = ({
	match,
	name = match.name,
	valueName = "value",
	createBadSignatureMessage = defaultCreateSignatureMessage,
}) => {
	const matcher = (...args) => {
		if (args.length === 0) {
			throw new Error(
				createBadSignatureMessage({
					type: "missing",
					name,
					args,
					fallback: defaultCreateSignatureMessage,
				}),
			)
		}
		if (args.length > 1) {
			throw new Error(
				createBadSignatureMessage({
					type: "extra",
					name,
					args,
					fallback: defaultCreateSignatureMessage,
				}),
			)
		}

		const [expected] = args

		const expectation = actual => {
			const trace = isTrace(actual)
				? actual
				: createNamedTrace(
						{
							actual,
							expected,
						},
						valueName,
					)
			actual = trace.getValue().actual
			const action = createAction()
			const pass = () => action.pass()
			const fail = data =>
				action.fail({
					actual,
					expected,
					trace,
					...data,
				})

			const returnValue = match({
				trace,
				expected,
				actual,
				pass,
				fail,
			})

			if (isMatcher(returnValue)) {
				const expectation = returnValue(expected)
				const assertion = expectation(trace)
				assertion.then(pass, fail)
			} else if (isAction(returnValue)) {
				returnValue.then(pass, fail)
			}

			return action.then(
				() => undefined,
				failure => {
					if (trace === failure.trace) {
						return createFailureMessage(failure)
					}
					return failure
				},
			)
		}
		return expectation
	}
	matcher[matchSymbol] = true
	return matcher
}

export const createFailedMatcher = value => {
	return createMatcher({
		match: ({ fail }) => fail(value),
	})
}

export const createPassedMatcher = value => {
	return createMatcher({
		match: ({ pass }) => pass(value),
	})
}

export const createMatcherFromFunction = fn => {
	return createMatcher({
		match: fn,
	})
}

export const createMatcherDiscovering = (discoverer, matcher) => {
	return createMatcherFromFunction(({ trace, actual }) => {
		fromFunction(() => discoverer(actual)).then(({ name, value, pass, fail }) => {
			const discoveredTrace = trace.discover(
				{
					actual: value,
					expected: matcher,
				},
				name,
			)
			matcher(matcher)(discoveredTrace).then(pass, fail)
		})
	})
}

// const createPropertiesFailureMessage = ({ type, trace, data }) => {
// 	if (type === "extra-recursion") {
// 		return `expect ${getValueNameFromTrace(trace)} to be ${prefixValue(
// 			trace.getExpected(),
// 		)} but got a circular reference`
// 	}
// 	if (type === "missing-recursion") {
// 		return `expect ${getValueNameFromTrace(trace)} to be a circular reference but got ${prefixValue(
// 			trace.getActual(),
// 		)}`
// 	}
// 	if (type === "extra") {
//		const actualReference = trace.actual.getReference()
//		if (actualReference) {
//			// retourne un autre message pour dire qu'on a une unexpected recursion
//			// mais en fait on s'en moque c'est juste une unexpected property ici
//		}
// 		return `unexpected ${trace.getName()} property on ${getValueNameFromTrace(
// 			trace.getParentTrace(),
// 		)}`
// 	}
// 	if (type === "missing") {
// 		return `expect ${trace.getName()} property on ${getValueNameFromTrace(
// 			trace.getParentTrace(),
// 		)} but missing`
// 	}
// 	if (type === "mismatch") {
// 		return `${getValueNameFromTrace(trace)} mismatch: ${data}`
// 	}
// }
