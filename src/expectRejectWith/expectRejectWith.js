import { expectMatch } from "../expectMatch/expectMatch.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectReject = thenable => {
	const action = createAction()

	thenable.then(
		value => action.fail(`thenable expected to reject resolved with ${uneval(value)}`),
		// setTimeout to avoir promise catching error
		reason => setTimeout(() => action.pass(reason))
	)
	return action
}

export const expectRejectWith = (thenable, expectedReason) =>
	expectReject(thenable).then(reason =>
		expectMatch(reason, expectedReason).then(
			null,
			message => `thenable rejected value mismatch: ${message}`
		)
	)
