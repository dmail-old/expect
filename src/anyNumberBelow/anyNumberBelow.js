import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

const createWrongTypeMessage = (actual, expected) =>
	`expect a number below ${expected} but got ${prefixValue(actual)}: ${actual}`

const createTooHighMessage = (actual, expected) =>
	`expect a number below ${expected} but got ${actual}`

const matchNumber = any(Number)
export const anyNumberBelow = expected =>
	createMatcher(actual => {
		return matchNumber(actual).then(
			() => {
				if (actual >= expected) {
					return failed(createTooHighMessage(actual, expected))
				}
				return passed(actual)
			},
			() => createWrongTypeMessage(actual, expected),
		)
	})
