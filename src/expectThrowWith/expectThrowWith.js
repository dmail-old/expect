import { expectMatch } from "../expectMatch/expectMatch.js"
import { failed } from "@dmail/action"

export const expectThrowWith = (fn, expectedException) => {
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
	return expectMatch(throwedValue, expectedException).then(
		null,
		failureMessage => `throwed exception mismatch: ${failureMessage}`
	)
}
