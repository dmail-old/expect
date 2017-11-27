import { label, createMatcher, matchAll } from "../matcher.js"
import { anyThenable } from "../anyThenable/anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { oneOrMoreParamSignature } from "../helper.js"

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

export const resolveMatching = oneOrMoreParamSignature({
	fn: (...args) =>
		createMatcher(actual => {
			return getValueResolvedByThenable(actual).then(matchAll(...args))
		}),
	createMessage: () =>
		`resolveMatching must be called with one or more argument, you can use resolveMatching(any())`,
})
