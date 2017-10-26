import { failed, passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"
import { expectNumber } from "../expectType/expectType.js"

export const matchClose = (number, allowedDistance = 1) =>
	createMatcher(actual =>
		expectNumber(actual).then(() => {
			const distance = Math.abs(actual - number)
			if (distance > allowedDistance) {
				return failed(`expect close to ${number} (+/-${allowedDistance}) but got ${actual}`)
			}
			return passed()
		})
	)
export const expectClose = createExpectFromMatcherFactory(matchClose)
