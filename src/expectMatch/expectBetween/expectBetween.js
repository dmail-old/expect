import { failed, passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"
import { expectNumber } from "../expectType/expectType.js"

export const matchAbove = above =>
	createMatcher(actual => {
		if (actual <= above) {
			return failed(`expect value above ${above} but got ${actual}`)
		}
		return passed()
	})
export const expectAbove = createExpectFromMatcherFactory(matchAbove)

export const matchBelow = below =>
	createMatcher(actual => {
		if (actual >= below) {
			return failed(`expect value below ${below} but got ${actual}`)
		}
		return passed()
	})
export const expectBelow = createExpectFromMatcherFactory(matchBelow)

export const matchBetween = (above, below) =>
	createMatcher(actual =>
		expectNumber(actual)
			.then(() => expectAbove(actual, above))
			.then(() => expectBelow(actual, below))
	)
export const expectBetween = createExpectFromMatcherFactory(matchBetween)
