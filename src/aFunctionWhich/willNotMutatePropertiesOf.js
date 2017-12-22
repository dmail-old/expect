import { createBehaviourFactory } from "../behaviour.js"
import { failed, passed } from "@dmail/action"
import { createMutationsMessages } from "./snapshotValue.js"

const createUnexpectedMutationsMessage = ({ messages }) => {
	return `${messages.length} unexpected mutations:
	${messages.join("\n")}`
}

export const willNotMutatePropertiesOf = createBehaviourFactory((value) => {
	return ({ observeMutations }) => {
		const getMutations = observeMutations(value)

		return () => {
			const messages = createMutationsMessages(getMutations())
			if (messages.length) {
				return failed(createUnexpectedMutationsMessage({ messages }))
			}
			return passed()
		}
	}
})
