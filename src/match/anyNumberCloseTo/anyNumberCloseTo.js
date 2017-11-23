import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { matchAnyNumber } from "../anyNumber/anyNumber.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

export const matchAnyNumberCloseTo = (number, allowedDistance = 1) =>
	createMatcher(actual =>
		matchAnyNumber()(actual).then(
			() => {
				const distance = Math.abs(actual - number)
				if (distance > allowedDistance) {
					return failed(
						`expect a number close to ${number} (+/-${allowedDistance}) but got ${actual}`,
					)
				}
				return passed()
			},
			() =>
				failed(
					`expect a number close to ${number} (+/-${allowedDistance}) but got ${prefixValue(
						actual,
					)}: ${actual}`,
				),
		),
	)
export const expectClose = createExpectFromMatcher(matchAnyNumberCloseTo)
