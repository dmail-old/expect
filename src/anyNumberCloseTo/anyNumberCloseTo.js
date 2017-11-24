import { createMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

export const matchAnyNumberCloseTo = (number, allowedDistance = 1) =>
	createMatcher(actual =>
		any(Number)(actual).then(
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
