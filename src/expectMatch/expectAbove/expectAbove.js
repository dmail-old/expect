import { failed, passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"
import { expectNumber, prefix } from "../expectType/expectType.js"

export const matchAbove = above =>
	createMatcher(actual =>
		expectNumber(actual).then(
			() => {
				if (actual <= above) {
					return failed(`expect value above ${above} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect value above ${above} but got ${prefix(typeof actual)}: ${actual}`)
		)
	)
export const expectAbove = createExpectFromMatcherFactory(matchAbove)
