// l'intérête principal de conserver un matcher et un expect séparé
// c'est de pouvoir, par la suite, exprimé qu'on souhaite matcher avec un matcher custom
// ce qui donne ceci :
// expectCalledWith(spy, 10)
// expectCalledWith(spy, matchClose(10))
// expectCalledWith(spy, matchBetween(5, 15))

import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const matchSymbol = Symbol()
export const isMatcher = value =>
	value !== null && value !== undefined && value.hasOwnProperty(matchSymbol)
const match = (actual, expected) => {
	if (isMatcher(expected)) {
		return expected[matchSymbol](actual)
	}
	if (actual !== expected) {
		return failed(`${uneval(actual)} does not match ${uneval(expected)}`)
	}
	return passed()
}

export const expectMatch = match

export const createMatcher = fn => {
	const matcher = {}
	matcher[matchSymbol] = fn
	Object.defineProperty(matcher, "constructor", {
		enumerable: false,
		/* istanbul ignore next */
		value: function Matcher() {}
	})
	return matcher
}

export const createExpectFromMatcherFactory = matcherFactory => (actual, ...args) =>
	expectMatch(actual, matcherFactory(...args))

export const matchAny = () => createMatcher(() => passed())
export const matchExactly = expected => createMatcher(actual => match(actual, expected))
export const matchNot = expected =>
	createMatcher(actual =>
		expectMatch(actual, expected).then(
			() => failed(`${uneval(actual)} matching ${uneval(expected)}`),
			() => passed()
		)
	)
export const expectNot = createExpectFromMatcherFactory(matchNot)

export const expectTrue = actual => expectMatch(actual, true)
export const expectFalse = actual => expectMatch(actual, false)
export const expectNull = actual => expectMatch(actual, null)
export const expectUndefined = actual => expectMatch(actual, undefined)
