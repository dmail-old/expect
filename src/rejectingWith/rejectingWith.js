import { label, createMatcher, matchAll, oneOrMoreParamSignature } from "../matcher.js"
import { anyThenable } from "../anyThenable/anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const matchThenable = anyThenable()
const getRejectionValue = actual => {
	return matchThenable(actual).then(() => {
		const action = createAction()

		actual.then(
			value => action.fail(`thenable expected to reject resolved with ${uneval(value)}`),
			// setTimeout to avoir promise catching error
			reason => setTimeout(() => action.pass(label(reason, `thenable resolve`))),
		)

		return action
	})
}

export const rejectingWith = oneOrMoreParamSignature({
	fn: (...args) =>
		createMatcher(actual => {
			return getRejectionValue(actual).then(matchAll(...args))
		}),
	createMessage: () =>
		`rejectingWith must be called with one or more argument, you can use rejectingWith(any())`,
})
