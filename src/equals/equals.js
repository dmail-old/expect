import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createEqualsFailureMessage = (actual, expected) =>
	`expecting ${uneval(expected)} but got ${uneval(actual)}`

export const equals = expected =>
	createMatcher(actual => {
		// eslint-disable-next-line eqeqeq
		if (actual != expected) {
			return failed(createEqualsFailureMessage(actual, expected))
		}
		return passed()
	})
