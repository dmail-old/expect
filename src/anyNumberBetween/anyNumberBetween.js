import { createMatcher } from "../matcher.js"
import { failed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"
import { anyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"
import { anyNumberBelow } from "../anyNumberBelow/anyNumberBelow.js"

export const matchAnyNumberBetween = (above, below) =>
	createMatcher(actual =>
		any(Number)(actual).then(
			() =>
				anyNumberAbove(above)(actual).then(
					() =>
						anyNumberBelow(below)(actual).then(null, () =>
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
