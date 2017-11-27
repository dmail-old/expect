import { label, createMatcher, matchAll } from "../matcher.js"
import { anySpy } from "../anySpy/anySpy.js"
import { strictEqual } from "../strictEqual/strictEqual.js"
import { createIndexes, emptyParamSignature } from "../helper.js"

const matchSpy = anySpy()
const getSpyCallCount = actual => {
	return matchSpy(actual).then(() => label(actual.getCallCount(), `${actual} call count`))
}

const getSpyExpectedCalls = (actual, expectedCallCount) => {
	return matchSpy(actual).then(() =>
		label(
			createIndexes(expectedCallCount).map(index => {
				const tracker = actual.track(index)
				return label(tracker, `${tracker}`)
			}),
			`${actual} calls`,
		),
	)
}

export const anySpyNeverCalled = emptyParamSignature({
	fn: () =>
		createMatcher(actual => {
			return getSpyCallCount(actual).then(strictEqual(0))
		}),
	createMessage: () => `anySpyNeverCalled must be called without argument`,
})

export const anySpyCalledExactlyMatching = (expectedCallCount, ...args) =>
	createMatcher(actual => {
		return getSpyCallCount(actual)
			.then(strictEqual(expectedCallCount))
			.then(() => getSpyExpectedCalls(actual, 1))
			.then(matchAll(...args))
	})
export const anySpyCalledOnce = (...args) => anySpyCalledExactlyMatching(1, ...args)
export const anySpyCalledTwice = (...args) => anySpyCalledExactlyMatching(2, ...args)
