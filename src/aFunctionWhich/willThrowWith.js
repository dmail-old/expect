import { createBehaviourFactory } from "../behaviour.js"
import { failed } from "@dmail/action"

export const willThrowWith = createBehaviourFactory({
	api: (throwedValue) => ({ throwedValue }),
	preventDuplicate: true,
	expect: ({ throwedValue }, { observeResultState, observeResultValue }) => {
		const getResultState = observeResultState()
		const getResultValue = observeResultValue()

		return () => {
			const state = getResultState()
			if (state === "returned") {
				return failed(`missing throw`)
			}
			return throwedValue(getResultValue())
		}
	},
})
