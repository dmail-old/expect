import { label, createMatcher } from "../matcher.js"
import { anyThenable } from "../anyThenable/anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { oneArgumentSignature } from "../helper.js"
import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

const matchThenable = anyThenable()
const getValueResolvedByThenable = actual => {
	return matchThenable(actual).then(() => {
		const action = createAction()

		actual.then(
			// setTimeout to avoir promise catching error
			value => setTimeout(() => action.pass(label(value, `value resolved by thenable`))),
			value => action.fail(`thenable expected to resolve rejected with ${uneval(value)}`),
		)

		return action
	})
}

export const resolveMatch = oneArgumentSignature({
	fn: expected =>
		createMatcher(actual => {
			return getValueResolvedByThenable(actual).then(createMatcherFrom(expected))
		}),
	createMessage: () =>
		`resolveMatch must be called with one argument, you can use resolveMatch(any())`,
})
