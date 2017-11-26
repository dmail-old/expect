import { createMatcher, createWithFromMatcher } from "../../expect.js"
import { anyThenable } from "../anyThenable.js"
import { createAction } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const anyThenableResolving = () =>
	createMatcher(actual => {
		return anyThenable()(actual).then(() => {
			const action = createAction()

			actual.then(
				// setTimeout to avoir promise catching error
				value => setTimeout(() => action.pass(value)),
				reason => action.fail(`thenable expected to resolve rejected with ${uneval(reason)}`),
			)

			return action
		})
	})

export const anyThenableResolvingWith = createWithFromMatcher(anyThenableResolving)
