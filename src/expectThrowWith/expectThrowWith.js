import { expectMatch } from "../expectMatch/expectMatch.js"
import { failed, passed } from "@dmail/action"

export const expectThrow = fn => {
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
	return passed(throwedValue)
}

export const expectThrowWith = (fn, expectedException) =>
	expectThrow(fn).then(throwedValue =>
		expectMatch(throwedValue, expectedException).then(
			null,
			failureMessage => `throwed exception mismatch: ${failureMessage}`
		)
	)
