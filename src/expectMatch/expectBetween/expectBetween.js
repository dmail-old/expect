import { failed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"
import { expectNumber, prefix } from "../expectType/expectType.js"
import { expectAbove } from "../expectAbove/expectAbove.js"
import { expectBelow } from "../expectBelow/expectBelow.js"

export const matchBetween = (above, below) =>
	createMatcher(actual =>
		expectNumber(actual).then(
			() =>
				expectAbove(actual, above).then(
					() =>
						expectBelow(actual, below).then(null, () =>
							failed(`expect value between ${above} and ${below} but got ${actual}`)
						),
					() => failed(`expect value between ${above} and ${below} but got ${actual}`)
				),
			() =>
				failed(
					`expect value between ${above} and ${below} but got ${prefix(typeof actual)}: ${actual}`
				)
		)
	)
export const expectBetween = createExpectFromMatcherFactory(matchBetween)
