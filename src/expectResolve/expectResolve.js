import { createExpectation } from "../match.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectResolve = thenable => {
	// we should ensure thenable is an object/function with a thenable method
	return createExpectation(() => {
		const action = createAction()

		thenable.then(
			// setTimeout to avoir promise catching error
			value => setTimeout(() => action.pass(value)),
			reason => action.fail(`thenable expected to resolve rejected with ${uneval(reason)}`),
		)

		return action
	})
}
