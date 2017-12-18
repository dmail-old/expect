import { createBehaviourFactory } from "../behaviour.js"
import { failed } from "@dmail/action"

const willThrowWithBehaviour = {
	type: "willThrowWith",
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
}

export const willThrowWith = createBehaviourFactory(willThrowWithBehaviour)
