import { createBehaviourFactory } from "../behaviour.js"
import { failed, passed } from "@dmail/action"

const createUnexpectedMutationsMessage = ({ mutations, value }) => {
	const createMutationsMessages = (mutations, value) => {
		return mutations.reduce((accumulator, mutation) => {
			if (mutation.type === "deleted") {
				return accumulator.concat(`${String(mutation.property)} deleted`)
			}
			if (mutation.type === "updated") {
				return accumulator.concat(
					`${String(mutation.property)} updated from ${String(mutation.value)} to ${String(
						value[mutation.property],
					)}`,
				)
			}
			if (mutation.type === "added") {
				return accumulator.concat(
					`${String(mutation.property)} added with ${String(value[mutation.property])}`,
				)
			}
			if (mutation.type === "mutated") {
				// faudrais filter mutation.mutations qui sont none
				return accumulator.concat(
					createMutationsMessages(mutation.mutations, value[mutation.property]),
				)
			}
			return accumulator
		}, [])
	}
	const messages = createMutationsMessages(mutations, value)
	return `${messages.length} unexpected mutations:
	${messages.join("\n")}`
}

const willNotMutatePropertiesOfBehaviour = {
	type: "willNotMutatePropertiesOf",
	api: (value) => ({ value }),
	preventDuplicate: true,
	isDuplicate: (self, other) => self.value === other.value,
	expect: ({ value }, { observeMutations }) => {
		const getMutations = observeMutations(value)

		return () => {
			const mutations = getMutations().filter(({ type }) => type !== "none")
			if (mutations.length) {
				return failed(createUnexpectedMutationsMessage({ mutations, value }))
			}
			return passed()
		}
	},
}

export const willNotMutatePropertiesOf = createBehaviourFactory(willNotMutatePropertiesOfBehaviour)
