import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { failed } from "@dmail/action"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

export const willThrowWith = createFactory(pureBehaviour, (value) => {
	const assertThrowedValue = createAssertionFrom(value)

	return {
		value,
		assert: ({ observeResultState, observeResultValue }) => {
			const getResultState = observeResultState()
			const getResultValue = observeResultValue()

			return () => {
				const state = getResultState()
				if (state === "returned") {
					return failed(`missing throw`)
				}
				return assertThrowedValue(getResultValue())
			}
		},
	}
})
