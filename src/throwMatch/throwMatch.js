import { label, createMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { failed, passed } from "@dmail/action"
import { oneArgumentSignature } from "../helper.js"
import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

const matchFunction = any(Function)
const getValueThrowedByFunctionCall = fn => {
	return matchFunction(fn).then(() => {
		let throwed = false
		let throwedValue

		try {
			fn()
		} catch (e) {
			throwed = true
			throwedValue = e
		}

		if (throwed === false) {
			return failed("missing throw")
		}
		return passed(label(throwedValue), `${fn} throw`)
	})
}

export const throwMatching = () =>
	oneArgumentSignature({
		fn: expected =>
			createMatcher(actual => {
				return getValueThrowedByFunctionCall(actual).then(createMatcherFrom(expected))
			}),
		createMessage: () =>
			`throwMatching() must be called with one or more argument, you can use throwMatching(any())`,
	})
