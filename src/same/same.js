import { createMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { matchConstructedByFromValue } from "../any/any.js"
import { canHaveProperties, haveProperties } from "../haveProperties/haveProperties.js"

export const same = expectedValue =>
	createMatcher(actualValue => {
		if (expectedValue === null) {
			if (actualValue === null) {
				return passed()
			}
			return failed()
		}
		if (expectedValue === undefined) {
			if (actualValue === undefined) {
				return passed()
			}
			return failed()
		}
		if (expectedValue === actualValue) {
			return passed()
		}
		return matchConstructedByFromValue(expectedValue).then(() => {
			if (canHaveProperties(expectedValue)) {
				return haveProperties(expectedValue)(actualValue)
			}
			return passed()
		})
	})
