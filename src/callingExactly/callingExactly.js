import { label, createMatcher, matchAll, composeMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { propertiesMatchAllowingExtra } from "../propertiesMatch/propertiesMatch.js"
import { sequence, reduce } from "@dmail/action"
import { anyNumberAbove } from "../anyNumberAbove/anyNumberAbove.js"
import { createIndexes } from "../helper.js"

const matchFunction = any(Function)

const getSpiesCallComingFromFunction = (fn, spies) => {
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
const getSpyCallComingFromFunction = (fn, spy) => getSpiesCallComingFromFunction(fn, [spy])[0]

export const callingExactly = (spy, expectedCallCount, ...args) =>
	createMatcher(actual => {
		return getSpyCallComingFromFunction(actual, spy).then(
			matchAll(propertiesMatchAllowingExtra({ length: expectedCallCount }), composeMatcher(args)),
		)
	})

export const callingOnce = (spy, ...args) => callingExactly(spy, 1, ...args)
export const callingTwice = (spy, ...args) => callingExactly(spy, 2, ...args)

const ensureSpiesCalledExactly = (spiesCalls, expectedCallCount) => {
	return sequence(spiesCalls, spyCalls => {
		return propertiesMatchAllowingExtra({ length: expectedCallCount })(spyCalls)
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

export const callingSequenceExactly = (spies, expectedSequenceCount, ...args) =>
	createMatcher(actual => {
		return getSpiesCallComingFromFunction(actual, spies).then(spiesCalls => {
			return ensureSpiesCalledExactly(spiesCalls, expectedSequenceCount)
				.then(() => {
					return ensureSpiesRepeatSequence(spiesCalls, spies, expectedSequenceCount)
				})
				.then(() => {
					return matchAll(...args)(spiesCalls)
				})
		})
	})
export const callingSequenceOnce = (spies, ...args) => callingSequenceExactly(spies, 1, ...args)

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
