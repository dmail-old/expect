import { createBehaviourFactory } from "../behaviour.js"
import { canHaveOwnProperty } from "../helper.js"
import { willMutatePropertiesOf } from "./willMutatePropertiesOf.js"

const willMutateArgumentsBehaviour = {
	type: "willMutateArguments",
	api: (...argMutations) => ({ argMutations }),
	preventDuplicate: true,
	split: ({ argMutations }, { getArgValues }) => {
		const args = getArgValues()
		if (args.length !== argMutations.lenth) {
			throw new Error(
				`willMutateArgument expect ${argMutations.lenth} argument mutation but there is ${
					args.length
				} argument`,
			)
		}
		return argMutations
			.filter((argMutation, index) => {
				const arg = args[index]
				return canHaveOwnProperty(arg)
			})
			.map((argMutation, index) => {
				const arg = args[index]
				return willMutatePropertiesOf(arg, argMutation)
			})
	},
}

export const willMutateArguments = createBehaviourFactory(willMutateArgumentsBehaviour)
