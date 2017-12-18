import { createBehaviourFactory } from "../behaviour.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createUnexpectedCallsMessage = ({ spy, calls }) => {
	const unexpectedCallMessages = calls.map((unexpectedCall) => {
		return `call with (${uneval(unexpectedCall.tracker.createReport().argValues)})`
	})

	return `${calls.length} unexpected call to ${spy}
	${unexpectedCallMessages.join("\n")}`
}

const willNotCallSpyBehaviour = {
	type: "willNotCallSpy",
	api: (spy) => ({ spy }),
	preventDuplicate: true,
	isDuplicate: (self, other) => self.spy === other.spy,
	expect: ({ spy }, { observeCalls }) => {
		const getCalls = observeCalls(spy)
		return () => {
			const unexpectedCalls = getCalls()
			if (unexpectedCalls.length) {
				return failed(createUnexpectedCallsMessage({ spy, calls: unexpectedCalls }))
			}
			return passed()
		}
	},
}

export const willNotCallSpy = createBehaviourFactory(willNotCallSpyBehaviour)
