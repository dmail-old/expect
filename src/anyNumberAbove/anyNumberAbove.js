import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

const createWrongTypeMessage = (actual, expected) =>
	`expect a number above ${expected} but got ${prefixValue(actual)}: ${actual}`

const createTooLowMessage = (actual, expected) =>
	`expect a number above ${expected} but got ${actual}`

const matchNumber = any(Number)
export const anyNumberAbove = expected =>
	createMatcher(actual => {
		return matchNumber(actual).then(
			() => {
				if (actual <= expected) {
					return failed(createTooLowMessage(actual, expected))
				}
				return passed()
			},
			() => createWrongTypeMessage(actual, expected),
		)
	})
