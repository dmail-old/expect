import { mixin } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { canSetOwnProperty } from "../helper.js"
import { willMutatePropertiesOf } from "./willMutatePropertiesOf.js"

export const willMutateArguments = (...argMutations) =>
	mixin(pureBehaviour, () => ({
		factory: willMutateArguments,
		split: ({ getArgValues }) => {
			const args = getArgValues()
			if (args.length !== argMutations.lenth) {
				throw new Error(
					`willMutateArgument expect ${argMutations.lenth} argument mutation but there is ${
						args.length
					} argument`,
				)
			}
			return argMutations
				.filter((argMutation, index) => canSetOwnProperty(args[index]))
				.map((argMutation, index) => willMutatePropertiesOf(args[index], argMutation))
		},
	}))
