import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createLooseEqualFailureMessage = (actual, expected) =>
	`expecting ${uneval(expected)} but got ${uneval(actual)}`

export const looseEqual = expected =>
	createMatcher(actual => {
		// eslint-disable-next-line eqeqeq
		if (actual != expected) {
			return failed(createLooseEqualFailureMessage(actual, expected))
		}
		return passed()
	})
