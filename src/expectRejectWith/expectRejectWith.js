import { expectMatch } from "../expectMatch/expectMatch.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectRejectWith = (thenable, expectedReason) => {
	const action = createAction()

	thenable.then(
		value => action.fail(`thenable expected to reject resolved with ${uneval(value)}`),
		reason =>
			// setTimeout to avoir promise catching error
			setTimeout(() =>
				action.pass(
					expectMatch(reason, expectedReason).then(
						null,
						message => `thenable rejected value mismatch: ${message}`
					)
				)
			)
	)

	return action
}
