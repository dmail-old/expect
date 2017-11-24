import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { matchConstructedByFromValue } from "../constructedBy/constructedBy.js"
import { matchHavingProperties } from "../havingProperties/havingProperties.js"

export const match = expectedValue =>
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
			if (typeof expectedValue !== "object" && typeof expectedValue !== "function") {
				return passed()
			}
			return matchHavingProperties(expectedValue)(actualValue)
		})
	})

export const expectMatch = createExpectFromMatcher(match)
