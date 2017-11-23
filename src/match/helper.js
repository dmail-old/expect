// l'intérête principal de conserver un matcher et un expect séparé
// c'est de pouvoir, par la suite, exprimé qu'on souhaite matcher avec un matcher custom
// ce qui donne ceci :
// expectCalledOnceMatching(spy, 10)
// expectCalledWith(spy, matchClose(10))
// expectCalledWith(spy, matchBetween(5, 15))

const matchSymbol = Symbol()
export const isMatcher = value =>
	value !== null && value !== undefined && value.hasOwnProperty(matchSymbol)

export const createMatcher = fn => {
	const matcher = (...args) => fn(...args)
	matcher[matchSymbol] = true
	Object.defineProperty(matcher, "constructor", {
		enumerable: false,
		/* istanbul ignore next */
		value: function Matcher() {},
	})
	return matcher
}

export const createExpectFromMatcher = matcher => (actual, ...args) => {
	return matcher(actual)(...args)
}
