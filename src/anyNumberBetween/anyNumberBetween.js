import { createMatcher } from "../matcher.js"
import { any, prefixValue } from "../any/any.js"
import { anyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"
import { anyNumberBelow } from "../anyNumberBelow/anyNumberBelow.js"

const createWrongTypeMessage = (actual, above, below) =>
	`expect a number between ${above} and ${below} but got ${prefixValue(actual)}: ${actual}`
const createTooSmallMessage = (actual, above, below) =>
	`expect a number between ${above} and ${below} but got ${actual}`
const createTooBigMessage = (actual, above, below) =>
	`expect a number between ${above} and ${below} but got ${actual}`

const matchNumber = any(Number)
export const matchAnyNumberBetween = (above, below) =>
	createMatcher(actual => {
		return matchNumber(actual).then(
			() =>
				anyNumberAbove(above)(actual).then(
					() =>
						anyNumberBelow(below)(actual).then(null, () =>
							createTooBigMessage(actual, above, below),
						),
					() => createTooSmallMessage(actual, above, below),
				),
			() => createWrongTypeMessage(actual, above, below),
		)
	})
