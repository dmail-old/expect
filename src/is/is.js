import { createMatcherFromFunction } from "../matcher.js"
import { uneval } from "@dmail/uneval"

const createIsFailureMessage = (expected, actual) =>
	`expect ${uneval(expected)} but got ${uneval(actual)}`

export const is = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (actual === expected) {
		return pass()
	}
	return fail(createIsFailureMessage(expected, actual))
})
