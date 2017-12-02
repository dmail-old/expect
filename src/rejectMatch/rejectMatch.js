import { label, createMatcher } from "../matcher.js"
import { anyThenable } from "../anyThenable/anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { oneArgumentSignature } from "../helper.js"
import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

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

export const rejectMatch = oneArgumentSignature({
	fn: expected =>
		createMatcher(actual => {
			return getValueRejectedByThenable(actual).then(createMatcherFrom(expected))
		}),
	createMessage: () =>
		`rejectMatch must be called with one argument, you can use rejectMatch(any())`,
})
