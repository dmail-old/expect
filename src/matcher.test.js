import { createMatcher } from "./matcher.js"
import { createTest } from "@dmail/test"
import assert from "assert"

export const test = createTest({
	"custom matcher nested": ({ pass }) => {
		const matcherA = createMatcher(({ expected, actual }) => {})
		const expectedA = 10
		const matchA = matcherA(expectedA)
		const matcherB = createMatcher(({ expected, actual, match }) => {
			return match(matchA)
		})
		const expectedB = 8
		const matchB = matcherB(expectedB)

		const actual = 9
		matchB(actual)

		pass()
	},
})
