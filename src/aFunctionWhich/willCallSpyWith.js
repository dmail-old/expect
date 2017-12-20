import { createBehaviourFactory } from "../behaviour.js"
import { failed } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { exactProperties } from "../properties/properties.js"

const createMissingCallMessage = ({ spy, calls }) => {
	if (calls.length === 0) {
		return `missing call to ${spy} which was never called`
	}
	return `missing call to ${spy} which was called ${calls.length} times`
}

const createExtraCallMessage = ({ spy, calls }) => {
	const extraCalls = calls.map((call) => {
		return `- call with (${uneval(call.tracker.createReport().argValues)})`
	})
	return `${calls.length} extra call to ${spy}:
	${extraCalls.join("\n")}`
}

const willCallSpyWithBehaviour = {
	type: "willCallSpyWith",
	api: (spy, ...argValues) => ({ spy, argValues }),
	preventDuplicate: false,
	expect: ({ spy, argValues }, { observeCalls, getIndex, getBehaviours }) => {
		const expectedSpy = spy
		const behaviours = getBehaviours()
		const previousSimilarBehavioursWithSameSpy = behaviours
			.slice(0, getIndex())
			.filter((previousBehaviour) => {
				return (
					previousBehaviour.behaviour === willCallSpyWithBehaviour && previousBehaviour.spy === spy
				)
			})
		const expectedIndex = previousSimilarBehavioursWithSameSpy.length

		const getActualCalls = observeCalls(spy)

		return () => {
			const actualCalls = getActualCalls()
			const actualCall = actualCalls[expectedIndex]

			if (!actualCall) {
				return failed(createMissingCallMessage({ index: expectedIndex, spy, calls: actualCalls }))
			}

			const actualSpy = actualCall.spy
			const actualTracker = actualCall.tracker

			if (actualSpy !== expectedSpy) {
				return failed(`unexpected call to ${actualSpy}, expecting a call to ${expectedSpy}`)
			}

			const assertArguments = exactProperties(argValues)
			return assertArguments(actualTracker.createReport().argValues)
				.then(null, (message) => {
					return `${actualTracker} call arguments mismatch: ${message}`
				})
				.then(() => {
					const isLastCallSpyWith = behaviours
						.slice(getIndex())
						.some(({ behaviour }) => behaviour === willCallSpyWithBehaviour)

					if (isLastCallSpyWith === false) {
						return
					}
					const extraCalls = actualCalls.slice(getIndex())
					if (extraCalls.length) {
						return failed(createExtraCallMessage({ spy, calls: extraCalls }))
					}
				})
		}
	},
}

export const willCallSpyWith = createBehaviourFactory(willCallSpyWithBehaviour)