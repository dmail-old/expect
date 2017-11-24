import { createMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { prefix } from "../any/any.js"

export const matchType = expectedType =>
	createMatcher(value => {
		const actualType = typeof value
		if (actualType !== expectedType) {
			return failed(`expect ${prefix(expectedType)} but got ${prefix(actualType)}`)
		}
		return passed()
	})
