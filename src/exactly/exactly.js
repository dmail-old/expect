import { createMatcherFromFunction } from "../matcher.js"
import { uneval } from "@dmail/uneval"

const createExactlyFailureMessage = (actual, expected) =>
	`expect ${uneval(expected)} but got ${uneval(actual)}`

export const exactly = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (actual === expected) {
		return pass()
	}
	return fail({
		type: "exactly",
		message: createExactlyFailureMessage(actual, expected),
	})
})
