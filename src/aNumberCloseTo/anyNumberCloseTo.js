import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { any, prefixValue } from "../any/any.js"

const createTooFarMessage = (actual, expected, allowedDistance) =>
	`expect a number close to ${expected} (+/-${allowedDistance}) but got ${actual}`

const createWrongTypeMessage = (actual, expected, allowedDistance) =>
	`expect a number close to ${expected} (+/-${allowedDistance}) but got ${prefixValue(actual)}: ${
		actual
	}`

const matchNumber = any(Number)
export const matchAnyNumberCloseTo = (expected, allowedDistance = 1) =>
	createMatcher(actual => {
		return matchNumber(actual).then(
			() => {
				const distance = Math.abs(actual - expected)
				if (distance > allowedDistance) {
					return failed(createTooFarMessage(actual, expected, allowedDistance))
				}
				return passed()
			},
			() => createWrongTypeMessage(actual, expected, allowedDistance),
		)
	})
