import { hasProperty } from "./helper.js"
import { createAction, isAction } from "@dmail/action"
import { sign, oneArgument } from "./signature.js"

const matchSymbol = Symbol()
const assertSymbol = Symbol()

export const isMatcher = (value) => hasProperty(value, matchSymbol)
export const isAssertion = (value) => hasProperty(value, assertSymbol)

export const createAssertionFromFunction = (fn) => {
	const assert = sign(oneArgument, (actual) => {
		const action = createAction()
		const pass = (data) => action.pass(data)
		const fail = (data) => action.fail(data)

		const returnValue = fn({
			actual,
			fail,
			pass,
		})

		if (isAction(returnValue)) {
			returnValue.then(pass, fail)
		}

		return action
	})
	assert[assertSymbol] = true
	return assert
}

export const createMatcher = ({ match }) => {
	const matcher = sign(oneArgument, (expected) => {
		return createAssertionFromFunction(({ actual, fail, pass }) => {
			return match({ actual, fail, pass, expected })
		})
	})
	matcher[matchSymbol] = true
	// matcher.name = name
	return matcher
}

export const createMatcherFromFunction = (fn, name) => {
	return createMatcher({
		match: fn,
		name: name || fn.name,
	})
}
