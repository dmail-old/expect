import { createMatcherFromFunction } from "../matcher.js"
import { matchConstructedByFromValue } from "../any/any.js"
import { exactProperties } from "../properties/properties.js"
import { uneval } from "@dmail/uneval"
import { canHaveProperty } from "../helper.js"

export const same = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (expected === null) {
		if (actual === null) {
			return pass()
		}
		return fail(`expect null but got ${uneval(actual)}`)
	}
	if (expected === undefined) {
		if (actual === undefined) {
			return pass()
		}
		return fail(`expect undefined but got ${uneval(actual)}`)
	}
	if (expected === actual) {
		return pass()
	}
	return matchConstructedByFromValue(expected)(actual).then(() => {
		if (canHaveProperty(expected)) {
			return exactProperties(expected)(actual)
		}
		return pass()
	})
})
