import { all, failed, passed } from "@dmail/action"
// import { uneval } from "../../uneval.js"

import { expectCalledExactly } from "../expectCalledExactly/expectCalledExactly.js"
import { expectCalled } from "../expectCalled/expectCalled.js"
import { createIndexes } from "../../helper.js"

const createActualFailedArityMessage = (actual, expected) => {
	const missingCount = expected - actual
	const extraCount = actual - expected

	if (missingCount > 0) {
		if (actual === 0) {
			return "it was called without argument"
		}
		if (actual === 1) {
			return "it was called with only one argument"
		}
		if (actual === 2) {
			return "it was called with only two arguments"
		}
		return `it was called with only ${actual} arguments`
	}

	if (extraCount === 1) {
		if (expected === 0) {
			return "it was called with an unexpected argument"
		}
		return "it was called with an extra argument"
	}
	if (extraCount === 2) {
		if (expected === 0) {
			return "it was called with two unexpected arguments"
		}
		return "it was called with two extra arguments"
	}
	if (expected === 0) {
		return `it was called with ${extraCount} unexpected arguments`
	}
	return `it was called with ${extraCount} extra arguments`
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
		return `expect ${tracker} to be called with two arguments but ${createActualFailedArityMessage(
			actual,
			expected,
			actualArguments
		)}`
	}

	return `expect ${tracker} to be called with ${expected} arguments but ${createActualFailedArityMessage(
		actual,
		expected,
		actualArguments
	)}`
}

export const expectArity = (tracker, expectedArity) => {
	const actualArguments = tracker.createReport().argValues
	const actualArity = actualArguments.length
	if (actualArity !== expectedArity) {
		return failed(createFailedArityMessage(tracker, actualArity, expectedArity, actualArguments))
	}
	return passed()
}

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
