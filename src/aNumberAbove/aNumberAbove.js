import { createMatcherFromFunction } from "../matcher.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { failed, passed } from "@dmail/action"

const createWrongTypeMessage = (expected, actual) =>
	`actual:
${actual}

expected:
a number above ${expected}
`

const createTooLowMessage = (expected, actual) =>
	`actual:
${actual}

expected:
a number above ${expected}
`

const constructedByNumber = constructedBy(Number)

export const aNumberAbove = createMatcherFromFunction(({ actual, expected }) => {
	return constructedByNumber(actual).then(
		() => {
			if (actual <= expected) {
				return failed(createTooLowMessage(expected, actual))
			}
			return passed()
		},
		() => createWrongTypeMessage(expected, actual),
	)
})
