import { createBehaviourFactory } from "../behaviour.js"
import { failed, passed } from "@dmail/action"

const willNotMutatePropertiesOfBehaviour = {
	type: "willNotMutatePropertiesOf",
	api: (value) => ({ value }),
	preventDuplicate: true,
	isDuplicate: (self, other) => self.value === other.value,
	expect: ({ value }, { observeMutations }) => {
		const getMutations = observeMutations(value)

		return () => {
			const mutations = getMutations()
			if (mutations.length) {
				// const mutations = valueMutations.mutations
				// 4 unexpected mutations :
				// bar property updated from ${uneval()} to ${uneval()}
				// stuff property updated from to...
				// foo property added with ${uneval()}
				// name property deleted
				return failed(``)
			}
			return passed()
		}
	},
}

export const willNotMutatePropertiesOf = createBehaviourFactory(willNotMutatePropertiesOfBehaviour)
