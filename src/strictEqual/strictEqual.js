import { createMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const strictEqual = expectedValue =>
	createMatcher(actualValue => {
		if (actualValue !== expectedValue) {
			return failed(`expecting ${uneval(expectedValue)} but got ${uneval(actualValue)}`)
		}
		return passed()
	})
