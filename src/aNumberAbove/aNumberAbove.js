import { createMatcherFromFunction } from "../matcher.js"
import { constructedBy, prefixValue } from "../constructedBy/constructedBy.js"

const createWrongTypeMessage = (expected, actual) =>
	`expect a number above ${expected} but got ${prefixValue(actual)}: ${actual}`

const createTooLowMessage = (expected, actual) =>
	`expect a number above ${expected} but got ${actual}`

const constructedByNumber = constructedBy(Number)

export const aNumberAbove = createMatcherFromFunction(({ actual, expected, fail, pass }) => {
	return constructedByNumber(actual).then(
		() => {
			if (actual <= expected) {
				return fail(createTooLowMessage(expected, actual))
			}
			return pass()
		},
		() => createWrongTypeMessage(expected, actual),
	)
})
