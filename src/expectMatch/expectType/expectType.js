import { failed } from "@dmail/action"
import { createMatcher, createExpectFromMatcher } from "../expectMatch.js"

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
	})

export const matchFunction = matchType("function")
export const matchObject = matchType("object")
export const matchNumber = matchType("number")

export const expectType = createExpectFromMatcher(matchType)
export const expectFunction = createExpectFromMatcher(matchFunction)
export const expectObject = createExpectFromMatcher(matchObject)
export const expectNumber = createExpectFromMatcher(matchNumber)
