import { createMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

export const anyNumberAbove = above =>
	createMatcher(actual =>
		any(Number)(actual).then(
			() => {
				if (actual <= above) {
					return failed(`expect a number above ${above} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect a number above ${above} but got ${prefixValue(actual)}: ${actual}`),
		),
	)
