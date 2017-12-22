import { createBehaviourFactory } from "../behaviour.js"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

const willReturnWithBehaviour = {
	type: "willReturnWith",
	preventDuplicate: true,
	api: (returnedValue) => ({ returnedValue }),
	expect: ({ returnedValue }, { observeResultValue }) => {
		const getResultValue = observeResultValue()
		const assertReturnValue = createAssertionFrom(returnedValue)

		return () => {
			return assertReturnValue(getResultValue())
		}
	},
}

export const willReturnWith = createBehaviourFactory(willReturnWithBehaviour)
