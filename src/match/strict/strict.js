import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const matchStrict = expectedValue =>
	createMatcher(actualValue => {
		if (actualValue !== expectedValue) {
			return failed(`expecting ${uneval(expectedValue)} but got ${uneval(actualValue)}`)
		}
		return passed()
	})
export const expectStrict = createExpectFromMatcher(matchStrict)
