import { hasProperty } from "./helper.js"
import { createAction, isAction } from "@dmail/action"
import { oneArgumentSignature } from "./signature"

const matchSymbol = Symbol()
const assertSymbol = Symbol()

export const isMatcher = value => hasProperty(value, matchSymbol)
export const isAssertion = value => hasProperty(value, assertSymbol)

export const createMatcher = ({ match, name }) => {
	const matcher = oneArgumentSignature(expected => {
		const assert = oneArgumentSignature(actual => {
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
		})
		assert[assertSymbol] = true
		assert.matcher = matcher
		assert.name = name

		return assert
	})
	matcher[matchSymbol] = true
	matcher.name = name
	return matcher
}

export const isMatcherOf = (matcher, value) => isAssertion(value) && value.matcher === matcher

export const createMatcherFromFunction = (fn, name) => {
	return createMatcher({
		match: fn,
		name: name || fn.name,
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
