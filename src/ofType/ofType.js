import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { prefix } from "../any/any.js"

const createOfTypeFailureMessage = (actual, expected, actualType) =>
	`expect ${prefix(expected)} but got ${prefix(actualType)}`

export const ofType = expected =>
	createMatcher(actual => {
		const actualType = typeof actual
		if (actualType !== expected) {
			return failed(createOfTypeFailureMessage(actual, expected, actualType))
		}
		return passed()
	})
