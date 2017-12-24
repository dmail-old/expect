import { createMatcherFromFunction } from "../matcher.js"
import { uneval } from "@dmail/uneval"

const createIsFailureMessage = (expected, actual) =>
	`actual is:
${uneval(actual)}

when expecting:
${uneval(expected)}
`

export const is = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (actual === expected) {
		return pass()
	}
	return fail(createIsFailureMessage(expected, actual))
})
