import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { matchConstructedByFromValue } from "../any/any.js"
import { canHaveProperties, propertiesMatch } from "../propertiesMatch/propertiesMatch.js"
import { uneval } from "@dmail/uneval"

export const same = expected => {
	const matchProperties = propertiesMatch(expected)

	return createMatcher(actual => {
		if (expected === null) {
			if (actual === null) {
				return passed()
			}
			return failed(`expecting null but got ${uneval(actual)}`)
		}
		if (expected === undefined) {
			if (actual === undefined) {
				return passed()
			}
			return failed(`expecting undefined but got ${uneval(actual)}`)
		}
		if (expected === actual) {
			return passed()
		}
		return matchConstructedByFromValue(expected).then(() => {
			if (canHaveProperties(expected)) {
				return matchProperties(actual)
			}
			return passed()
		})
	})
}
