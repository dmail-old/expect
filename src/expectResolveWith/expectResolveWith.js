import { expectMatch } from "../expectMatch/expectMatch.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectResolveWith = (thenable, expectedResolutionValue) => {
	const action = createAction()

	thenable.then(
		value => {
			// setTimeout to avoir promise catching error
			setTimeout(() =>
				action.pass(
					expectMatch(value, expectedResolutionValue).then(
						null,
						message => `thenable resolved value mismatch: ${message}`
					)
				)
			)
		},
		reason => action.fail(`thenable expected to resolve rejected with ${uneval(reason)}`)
	)

	return action
}
