import { createMatcherFromFunction } from "../matcher.js"
import { uneval } from "@dmail/uneval"

const createExactlyFailureMessage = (expected, actual) =>
	`expect ${uneval(expected)} but got ${uneval(actual)}`

export const exactly = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (actual === expected) {
		return pass()
	}
	return fail(createExactlyFailureMessage(expected, actual))
})
