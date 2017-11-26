import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

export const anyNumberBelow = below =>
	createMatcher(actual =>
		any(Number)(actual).then(
			() => {
				if (actual >= below) {
					return failed(`expect a number below ${below} but got ${actual}`)
				}
				return passed()
			},
			() => failed(`expect a number below ${below} but got ${prefixValue(actual)}: ${actual}`),
		),
	)
