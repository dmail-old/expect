import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed } from "@dmail/action"
import { matchAnyNumber } from "../anyNumber/anyNumber.js"
import { matchAnyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"
import { matchAnyNumberBelow } from "../anyNumberBelow/anyNumberBelow.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

export const matchAnyNumberBetween = (above, below) =>
	createMatcher(actual =>
		matchAnyNumber()(actual).then(
			() =>
				matchAnyNumberAbove(above)(actual).then(
					() =>
						matchAnyNumberBelow(below)(actual).then(null, () =>
							failed(`expect a number between ${above} and ${below} but got ${actual}`),
						),
					() => failed(`expect a number between ${above} and ${below} but got ${actual}`),
				),
			() =>
				failed(
					`expect a number between ${above} and ${below} but got ${prefixValue(actual)}: ${actual}`,
				),
		),
	)
export const expectAnyNumberBetween = createExpectFromMatcher(matchAnyNumberBetween)
