import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { matchAnyNumber } from "../anyNumber/anyNumber.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

export const matchAnyNumberBelow = below =>
	createMatcher(actual =>
		matchAnyNumber()(actual).then(
			() => {
				if (actual >= below) {
					return failed(`expect a number below ${below} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect a number below ${below} but got ${prefixValue(actual)}: ${actual}`),
		),
	)
export const expectAnyNumberBelow = createExpectFromMatcher(matchAnyNumberBelow)
