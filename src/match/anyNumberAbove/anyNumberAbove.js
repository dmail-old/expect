import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { matchAnyNumber } from "../anyNumber/anyNumber.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

export const matchAnyNumberAbove = above =>
	createMatcher(actual =>
		matchAnyNumber()(actual).then(
			() => {
				if (actual <= above) {
					return failed(`expect a number above ${above} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect a number above ${above} but got ${prefixValue(actual)}: ${actual}`),
		),
	)
export const expectAnyNumberAbove = createExpectFromMatcher(matchAnyNumberAbove)
