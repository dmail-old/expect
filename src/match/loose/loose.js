import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const matchLoose = expectedValue =>
	createMatcher(actualValue => {
		// eslint-disable-next-line eqeqeq
		if (actualValue != expectedValue) {
			return failed(`expecting ${uneval(expectedValue)} but got ${uneval(actualValue)}`)
		}
		return passed()
	})
export const expectLoose = createExpectFromMatcher(matchLoose)
