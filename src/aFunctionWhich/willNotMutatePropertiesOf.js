import { createBehaviourFactory } from "../behaviour.js"
import { failed, passed } from "@dmail/action"
import { createMutationsMessages } from "./snapshotValue.js"

const createUnexpectedMutationsMessage = ({ messages }) => {
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
			const messages = createMutationsMessages(getMutations())
			if (messages.length) {
				return failed(createUnexpectedMutationsMessage({ messages }))
			}
			return passed()
		}
	},
}

export const willNotMutatePropertiesOf = createBehaviourFactory(willNotMutatePropertiesOfBehaviour)
