import { createMatcherFromFunction } from "../matcher.js"
import { sameConstructor } from "../constructedBy/constructedBy.js"
import { exactProperties } from "../properties/properties.js"
import { uneval } from "@dmail/uneval"
import { canHaveProperty } from "../helper.js"

export const same = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	if (expected === actual) {
		return pass()
	}
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
	return sameConstructor(expected)(actual).then(() => {
		if (canHaveProperty(expected)) {
			return exactProperties(expected)(actual)
		}
		return pass()
	})
})
