import { createExpectation } from "../match.js"
// import { any } from "../any/any.js"
// import { havingPropertiesAllowingExtra } from "../havingProperties/havingProperties.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const expectReject = thenable => {
	// we should ensure thenable is object or function with then method
	// havingPropertiesAllowingExtra({
	// 	then: any(Function),
	// })(thenable)
	return createExpectation({
		getName: () => `thenable rejected value`,
		getValue: () => {
			const action = createAction()

			thenable.then(
				value => action.fail(`thenable expected to reject resolved with ${uneval(value)}`),
				// setTimeout to avoir promise catching error
				reason => setTimeout(() => action.pass(reason)),
			)

			return action
		},
	})
}
