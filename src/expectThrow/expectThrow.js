import { failed, passed } from "@dmail/action"

export const expectThrowWith = fn => {
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
