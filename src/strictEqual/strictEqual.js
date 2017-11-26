import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createStrictEqualFailureMessage = (actual, expected) =>
	`expecting ${uneval(expected)} but got ${uneval(actual)}`

export const strictEqual = expected =>
	createMatcher(actual => {
		if (actual !== expected) {
			return failed(createStrictEqualFailureMessage(actual, expected))
		}
		return passed()
	})
