import { createFactory } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const willNotCallSpy = createFactory(pureBehaviour, (spy) => {
	const createExpectedDescription = ({ fn }) => `${fn} must never call ${spy}`

	const createActualDescription = ({ fn, calls }) => {
		const unexpectedCallMessages = calls.map((unexpectedCall) => {
			return `${uneval(unexpectedCall.tracker.createReport().argValues)}`
		})

		return `${fn} called ${spy} ${calls.length} times:
${unexpectedCallMessages.join("\n")}`
	}

	const assert = ({ observeCalls }) => {
		const getCalls = observeCalls(spy)

		return () => {
			const unexpectedCalls = getCalls()
			if (unexpectedCalls.length) {
				return failed({ calls: unexpectedCalls })
			}
			return passed()
		}
	}

	return {
		spy,
		assert,
		createExpectedDescription,
		createActualDescription,
	}
})
