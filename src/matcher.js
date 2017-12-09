import { hasProperty } from "./helper.js"
import { createAction, isAction } from "@dmail/action"

const matchSymbol = Symbol()

export const isMatcher = value => hasProperty(value, matchSymbol)

const spaceWhenDefined = value => {
	if (value) {
		return `${value} `
	}
	return ""
}

const defaultCreateSignatureMessage = ({ name, type, args }) => {
	if (type === "missing") {
		return `${spaceWhenDefined(
			name,
		)}must be called with one argument but was called without. You can use any()`
	}
	return `${spaceWhenDefined(name)}must be called with one argument but was called with ${
		args.length
	}`
}

export const createMatcher = ({
	match,
	name = match.name,
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

		const assert = actual => {
			const action = createAction()
			const pass = data => action.pass(data)
			const fail = data => action.fail(data)

			const returnValue = match({
				actual,
				expected,
				fail,
				pass,
			})

			if (isAction(returnValue)) {
				returnValue.then(pass, fail)
			}

			return action
		}
		return assert
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
