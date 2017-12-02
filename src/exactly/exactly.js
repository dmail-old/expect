import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createExactlyFailureMessage = (actual, expected) =>
	`expect ${uneval(expected)} but got ${uneval(actual)}`

export const exactly = expected =>
	createMatcher(actual => {
		if (actual !== expected) {
			return failed(createExactlyFailureMessage(actual, expected))
		}
		return passed()
	})
