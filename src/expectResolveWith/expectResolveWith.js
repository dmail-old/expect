import { expectMatch } from "../expectMatch/expectMatch.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectResolve = thenable => {
	const action = createAction()

	thenable.then(
		// setTimeout to avoir promise catching error
		value => setTimeout(() => action.pass(value)),
		reason => action.fail(`thenable expected to resolve rejected with ${uneval(reason)}`)
	)

	return action
}

export const expectResolveWith = (thenable, expectedResolutionValue) =>
	expectResolve(thenable).then(value =>
		expectMatch(value, expectedResolutionValue).then(
			null,
			message => `thenable resolved value mismatch: ${message}`
		)
	)
