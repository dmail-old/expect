import { createFactory, isProductOf } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
import { failed } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { exactProperties } from "../properties/properties.js"
import { limitLines } from "./limitLines.js"

const createExtraCallMessage = limitLines({
	createIntro: ({ calls, spy }) => `${calls.length} extra calls to ${spy}`,
	getLines: ({ calls }) => calls,
	createLine: (call) => `${uneval(call.tracker.createReport().argValues)}`,
})

export const willCallSpyWith = createFactory(pureBehaviour, (spy, ...argValues) => {
	const assertArguments = exactProperties(argValues)

	const createExpectedDescription = ({ fn }) => {
		return `${fn} must call ${spy} with ${uneval(argValues)}`
	}

	const createActualDescription = ({ fn, type, actualSpy, index, calls, message }) => {
		if (type === "missing") {
			return `missing call n°${index} on ${spy} by ${fn}`
		}

		if (type === "unexpected") {
			return `${fn} call to ${actualSpy}`
		}

		if (type === "mismatch") {
			// faudrait qu'on sache quel argument est fucked
			return `${fn} call to ${spy} arguments mismatch ${message}`
		}

		if (type === "extra") {
			return createExtraCallMessage({ calls, spy })
		}
	}

	const assert = ({ observeCalls, index, behaviours }) => {
		const expectedSpy = spy
		const previousSimilarBehavioursWithSameSpy = behaviours
			.slice(0, index - 1)
			.filter((previousBehaviour) => {
				return isProductOf(willCallSpyWith, previousBehaviour) && previousBehaviour.spy === spy
			})
		const expectedIndex = previousSimilarBehavioursWithSameSpy.length
		const getActualCalls = observeCalls(spy)

		return () => {
			const actualCalls = getActualCalls()
			const actualCall = actualCalls[expectedIndex]

			if (!actualCall) {
				return failed({ type: "missing", index: expectedIndex })
			}

			const actualSpy = actualCall.spy
			const actualTracker = actualCall.tracker

			if (actualSpy !== expectedSpy) {
				return failed({ type: "unexpected", actualSpy, expectedSpy })
			}

			return assertArguments(actualTracker.createReport().argValues)
				.then(null, (message) => {
					return failed({ type: "mismatch", tracker: actualTracker, message })
				})
				.then(() => {
					const isLastCallSpyWith = behaviours
						.slice(index)
						.some((behaviour) => isProductOf(willCallSpyWith, behaviour))

					if (isLastCallSpyWith === false) {
						return
					}
					const extraCalls = actualCalls.slice(index + 1)
					if (extraCalls.length) {
						return failed({ type: "extra", calls: extraCalls })
					}
				})
		}
	}

	return {
		spy,
		argValues,
		createExpectedDescription,
		createActualDescription,
		assert,
	}
})
