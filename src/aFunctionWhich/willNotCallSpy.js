import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createUnexpectedCallsMessage = ({ spy, calls }) => {
	const unexpectedCallMessages = calls.map((unexpectedCall) => {
		return `
${uneval(unexpectedCall.tracker.createReport().argValues)}
		`
	})

	return `${calls.length} unexpected call to ${spy}:
${unexpectedCallMessages.join("")}`
}

export const willNotCallSpy = createFactory(pureBehaviour, (spy) => {
	return {
		spy,
		assert: ({ observeCalls }) => {
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
})
