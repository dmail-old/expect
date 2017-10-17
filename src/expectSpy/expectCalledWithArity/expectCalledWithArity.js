import { fromFunction, all } from "@dmail/action"
// import { uneval } from "../../uneval.js"

import { expectCalledExactly } from "../expectCalledExactly/expectCalledExactly.js"
import { expectCalled } from "../expectCalled/expectCalled.js"
import { createIndexes } from "../../helper.js"

const createActualFailedArityMessage = (actual, expected) => {
	const missingCount = actual - expected
	const extraCount = expected - actual

	if (missingCount === 1) {
		if (expected === 1) {
			return "it was called without argument"
		}
		return "one argument is missing"
	}
	if (missingCount === 2) {
		return "two arguments are missing"
	}
	if (missingCount > 0) {
		return `${missingCount} arguments are missing`
	}

	if (extraCount === 1) {
		return "it was called with an unexpected extra argument"
	}
	if (extraCount === 2) {
		return "it was called with two unexpected extra arguments"
	}
	return `it was called with ${extraCount} unexpected extra arguments`
}

const createFailedArityMessage = (tracker, actual, expected, actualArguments) => {
	if (expected === 0) {
		return `expect ${tracker} to be called without argument but ${createActualFailedArityMessage(
			actual,
			expected,
			actualArguments
		)}`
	}

	if (expected === 1) {
		return `expect ${tracker} to be called with one argument but ${createActualFailedArityMessage(
			actual,
			expected,
			actualArguments
		)}`
	}

	if (expected === 2) {
		return `expect ${tracker} to be called with two argument but ${createActualFailedArityMessage(
			actual,
			expected,
			actualArguments
		)}`
	}

	return `expect ${tracker} to be called with exactly ${expected} arguments but ${createActualFailedArityMessage(
		actual,
		expected,
		actualArguments
	)}`
}

export const expectArity = (tracker, expectedArity) =>
	fromFunction(({ fail, pass }) => {
		const actualArguments = tracker.createReport().argValues
		const actualArity = actualArguments.length
		if (actualArity !== expectedArity) {
			return fail(createFailedArityMessage(tracker, actualArity, expectedArity, actualArguments))
		}
		return pass()
	})

export const expectCalledWithArity = (tracker, expectedArity) =>
	expectCalled(tracker).then(() => expectArity(tracker, expectedArity))
export const expectCalledWithoutArgument = tracker => expectCalledWithArity(tracker, 0)

export const expectCalledExactlyWithoutArgument = (spy, expectedCallCount) =>
	expectCalledExactly(spy, expectedCallCount).then(() =>
		all(
			createIndexes(expectedCallCount).map(index => expectCalledWithoutArgument(spy.track(index)))
		)
	)
export const expectCalledOnceWithoutArgument = spy => expectCalledExactlyWithoutArgument(spy, 1)
export const expectCalledTwiceWithoutArgument = spy => expectCalledExactlyWithoutArgument(spy, 2)
