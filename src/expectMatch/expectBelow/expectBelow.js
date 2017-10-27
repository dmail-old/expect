import { failed, passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"
import { expectNumber, prefix } from "../expectType/expectType.js"

export const matchBelow = below =>
	createMatcher(actual =>
		expectNumber(actual).then(
			() => {
				if (actual >= below) {
					return failed(`expect value below ${below} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect value below ${below} but got ${prefix(typeof actual)}: ${actual}`)
		)
	)
export const expectBelow = createExpectFromMatcherFactory(matchBelow)
