import { createBehaviourFactory } from "../behaviour.js"

const whenCalledWithBehaviour = {
	type: "whenCalledWith",
	api: (...argValues) => ({ argValues }),
	preventDuplicate: true,
	isDuplicate: true,
	expect: ({ argValues }, { setArgValues }) => {
		setArgValues(argValues)
		return () => {}
	},
}

export const whenCalledWith = createBehaviourFactory(whenCalledWithBehaviour)
