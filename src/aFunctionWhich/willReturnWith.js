import { createBehaviourFactory } from "../behaviour.js"

const willReturnWithBehaviour = {
	type: "willReturnWith",
	preventDuplicate: true,
	api: (returnedValue) => ({ returnedValue }),
	expect: ({ returnedValue }, { observeResultValue }) => {
		const getResultValue = observeResultValue()

		return () => {
			return returnedValue(getResultValue())
		}
	},
}

export const willReturnWith = createBehaviourFactory(willReturnWithBehaviour)
