import { label, createMatcher, matchAll, composeMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { propertiesMatching } from "../properties/properties.js"
import { sequence, reduce } from "@dmail/action"
import { anyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"
import { createIndexes } from "../helper.js"

const matchFunction = any(Function)

const getSpiesCallComingFromFunctionCall = (fn, spies) => {
	return matchFunction(fn).then(() => {
		const spiesInfo = spies.map(spy => {
			const callCountBeforeCallingFunction = spy.getCallCount()
			const getCallCountBeforeCallingFunction = () => callCountBeforeCallingFunction
			return {
				getCallCountBeforeCallingFunction,
			}
		})
		fn()
		spies.forEach((spy, index) => {
			const spyInfo = spiesInfo[index]
			const callCountAfterCallingFunction = spy.getCallCount()
			const getCallCountAferCallingFunction = () => callCountAfterCallingFunction()
			const getCallComingFromFunction = () => {
				let index = spyInfo.getCallCountBeforeCallingFunction()
				const trackers = []
				while (index < callCountAfterCallingFunction) {
					trackers.push(spy.track(index))
					index++
				}
				return label(trackers, `${spy} calls coming from ${fn}`)
			}

			Object.assign(spyInfo, {
				getCallCountAferCallingFunction,
				getCallComingFromFunction,
			})
		})

		return spiesInfo.map(({ getCallComingFromFunction }) => getCallComingFromFunction())
	})
}

const getSpyCallComingFromFunctionCall = (fn, spy) =>
	getSpiesCallComingFromFunctionCall(fn, [spy])[0]

export const callSpyExactly = (spy, expectedCallCount, ...args) =>
	createMatcher(actual => {
		return getSpyCallComingFromFunctionCall(actual, spy).then(
			matchAll(propertiesMatching({ length: expectedCallCount }), composeMatcher(args)),
		)
	})
export const callSpyOnce = (spy, ...args) => callSpyExactly(spy, 1, ...args)
export const callSpyTwice = (spy, ...args) => callSpyExactly(spy, 2, ...args)

export const callSpiesExactly = (spies, expectedCallCount, ...args) =>
	createMatcher(actual => {
		return getSpiesCallComingFromFunctionCall(actual, spies).then(
			matchAll(propertiesMatching({ length: expectedCallCount }), composeMatcher(args)),
		)
	})
export const callSpiesOnce = (spies, ...args) => callSpiesExactly(spies, 1, ...args)
export const callSpiesTwice = (spies, ...args) => callSpiesExactly(spies, 2, ...args)

const ensureSpiesCalledExactly = (spiesCalls, expectedCallCount) => {
	return sequence(spiesCalls, spyCalls => {
		return propertiesMatching({ length: expectedCallCount })(spyCalls)
	})
}

const ensureSpiesRepeatSequence = (spiesCalls, expectedSpiesSequence, expectedSequenceCount) => {
	return sequence(createIndexes(expectedSequenceCount), sequenceIndex => {
		return reduce(
			spiesCalls[sequenceIndex],
			(previousOrder, spyCall) => {
				return anyNumberAbove(previousOrder)(spyCall.createReport().absoluteOrder)
			},
			-1,
		)
	})
}

export const callSpiesSequenceExactly = (spies, expectedSequenceCount, ...args) =>
	createMatcher(actual => {
		return getSpiesCallComingFromFunctionCall(actual, spies).then(spiesCalls => {
			return ensureSpiesCalledExactly(spiesCalls, expectedSequenceCount)
				.then(() => {
					return ensureSpiesRepeatSequence(spiesCalls, spies, expectedSequenceCount)
				})
				.then(() => {
					return matchAll(...args)(spiesCalls)
				})
		})
	})
export const callSpiesSequenceOnce = (spies, ...args) => callSpiesSequenceExactly(spies, 1, ...args)
export const callSpiesSequenceTwice = (spies, ...args) =>
	callSpiesSequenceExactly(spies, 2, ...args)

/*
callingSequenceOnce(
  () => {},
  [spyA, spyB],
  composeMatcher([
    calledWith(0),
    calledWith(1)
  ])
)

callingSequenceTwice(
  () => {},
  [spyA, spyB],
  composeMatcher([
    composeMatcher([
      calledWith(0),
      calledWith(1)
    ]),
    composeMatcher([
      calledWith(2),
      calledWith(3)
    ])
  ])
)
*/
