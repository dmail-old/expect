import { failed, passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"

const prefix = type => {
	if (type === "null" || type === "undefined") {
		return type
	}
	const firstLetter = type[0].toLowerCase()
	if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
		return `an ${type}`
	}
	return `a ${type}`
}

const createFailedTypeMessage = (value, actual, expected) =>
	`expect ${prefix(expected)} but got ${prefix(actual)}`

export const matchType = type =>
	createMatcher(value => {
		const actualType = typeof value
		if (actualType !== type) {
			return failed(createFailedTypeMessage(value, actualType, type))
		}
		return passed()
	})

export const matchFunction = () => matchType("function")
export const matchObject = () => matchType("object")
export const matchNumber = () => matchType("number")

export const expectType = createExpectFromMatcherFactory(matchType)
export const expectFunction = createExpectFromMatcherFactory(matchFunction)
export const expectObject = createExpectFromMatcherFactory(matchObject)
export const expectNumber = createExpectFromMatcherFactory(matchNumber)
