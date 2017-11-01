// l'intérête principal de conserver un matcher et un expect séparé
// c'est de pouvoir, par la suite, exprimé qu'on souhaite matcher avec un matcher custom
// ce qui donne ceci :
// expectCalledWith(spy, 10)
// expectCalledWith(spy, matchClose(10))
// expectCalledWith(spy, matchBetween(5, 15))

import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const matchSymbol = Symbol()

export const expectMatch = (actual, expected) => {
	if (expected !== null && expected !== undefined && expected.hasOwnProperty(matchSymbol)) {
		return expected[matchSymbol](actual)
	}
	if (actual !== expected) {
		return failed(`${uneval(actual)} does not match ${uneval(expected)}`)
	}
	return passed()
}

export const createMatcher = fn => ({
	[matchSymbol]: fn
})

export const matchAny = () => createMatcher(() => passed())

export const createExpectFromMatcherFactory = matcherFactory => (actual, ...args) =>
	expectMatch(actual, matcherFactory(...args))

export const expectTrue = actual => expectMatch(actual, true)
export const expectFalse = actual => expectMatch(actual, false)
export const expectNull = actual => expectMatch(actual, null)
export const expectUndefined = actual => expectMatch(actual, undefined)
