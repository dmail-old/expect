import { label, createMatcher, matchAll } from "../matcher.js"
import { anyThenable } from "../anyThenable/anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { oneOrMoreParamSignature } from "../helper.js"

const matchThenable = anyThenable()
const getValueRejectedByThenable = actual => {
	return matchThenable(actual).then(() => {
		const action = createAction()

		actual.then(
			value => action.fail(`thenable expected to reject resolved with ${uneval(value)}`),
			// setTimeout to avoir promise catching error
			value => setTimeout(() => action.pass(label(value, `value rejected by thenable`))),
		)

		return action
	})
}

export const rejectMatching = oneOrMoreParamSignature({
	fn: (...args) =>
		createMatcher(actual => {
			return getValueRejectedByThenable(actual).then(matchAll(...args))
		}),
	createMessage: () =>
		`rejectMatching must be called with one or more argument, you can use rejectMatching(any())`,
})
