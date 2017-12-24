import { createFactory, isProductOf } from "@dmail/mixin"
import { pureBehaviour } from "../behaviour.js"
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
	// we should limit the number of extra calls displayed (like 3 and add a sentend like and 345 more)
	const extraCalls = calls.map((call, index) => {
		return `
call n°${index}:
${uneval(call.tracker.createReport().argValues)}
`
	})
	return `${calls.length} extra call to ${spy}:

${extraCalls.join("")}
`
}

const createUnexpectedCallArguments = ({ tracker, message }) => {
	return `${tracker} call arguments mismatch:
${message}`
}

export const willCallSpyWith = createFactory(pureBehaviour, (spy, ...argValues) => {
	const assertArguments = exactProperties(argValues)

	return {
		spy,
		argValues,
		assert: ({ observeCalls, index, behaviours }) => {
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
					return failed(createMissingCallMessage({ index: expectedIndex, spy, calls: actualCalls }))
				}

				const actualSpy = actualCall.spy
				const actualTracker = actualCall.tracker

				if (actualSpy !== expectedSpy) {
					return failed(`unexpected call to ${actualSpy}, expecting a call to ${expectedSpy}`)
				}

				return assertArguments(actualTracker.createReport().argValues)
					.then(null, (message) => {
						return createUnexpectedCallArguments({ tracker: actualTracker, message })
					})
					.then(() => {
						const isLastCallSpyWith = behaviours
							.slice(index)
							.some((behaviour) => isProductOf(willCallSpyWith, behaviour))

						if (isLastCallSpyWith === false) {
							return
						}
						const extraCalls = actualCalls.slice(index)
						if (extraCalls.length) {
							return failed(createExtraCallMessage({ spy, calls: extraCalls }))
						}
					})
			}
		},
	}
})
