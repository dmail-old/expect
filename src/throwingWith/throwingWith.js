import {
	label,
	createMatcherFromGetter,
	emptyParamSignature,
	oneOrMoreParamSignature,
} from "../matcher.js"
import { any } from "../any/any.js"
import { failed, passed } from "@dmail/action"

const getThrowedValue = fn => {
	return any(Function)(fn).then(() => {
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

export const throwingWith = () =>
	oneOrMoreParamSignature({
		fn: createMatcherFromGetter(getThrowedValue),
		createMessage: `throwingWith() must be called with one or more argument, you can use throwingWith(any())`,
	})
