import { failed, passed } from "@dmail/action"
import { expectMatch, createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"

export const prefix = type => {
	if (type === "null" || type === "undefined") {
		return type
	}
	const firstLetter = type[0].toLowerCase()
	if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
		return `an ${type}`
	}
	return `a ${type}`
}

const createFailedTypeMessage = (actual, expected) =>
	`expect ${prefix(expected)} but got ${prefix(actual)}`

export const matchType = (...args) =>
	createMatcher(value => {
		const [type] = args
		const actualType = typeof value
		if (actualType !== type) {
			return failed(createFailedTypeMessage(actualType, type, value))
		}
		if (args.length > 1) {
			return expectMatch(value, args[1])
		}
		return passed()
	})
export const expectType = createExpectFromMatcherFactory(matchType)

const curry = (fn, ...curriedArgs) => (...args) => fn(...[...curriedArgs, ...args])

export const matchFunction = curry(matchType, "function")
export const matchObject = curry(matchType, "object")
export const matchNumber = curry(matchType, "number")
export const matchString = curry(matchType, "string")

export const expectFunction = createExpectFromMatcherFactory(matchFunction)
export const expectObject = createExpectFromMatcherFactory(matchObject)
export const expectNumber = createExpectFromMatcherFactory(matchNumber)
export const expectString = createExpectFromMatcherFactory(matchString)
