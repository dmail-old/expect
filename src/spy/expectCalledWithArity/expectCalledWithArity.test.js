import {
	expectCalledWithArity,
	expectCalledOnceWithoutArgument,
	expectCalledTwiceWithoutArgument
} from "./expectCalledWithArity.js"
import { createTest } from "@dmail/test"
import { createSpy } from "@dmail/spy"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.deepEqual(action.getResult(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.deepEqual(action.getResult(), value)
}

const createFakeTrackerCalledWithXArguments = count => ({
	toString: () => "fake tracker",
	createReport: () => ({
		called: true,
		argValues: new Array(count).fill(0)
	})
})

export default createTest({
	"expecting 0 and called with 0": ({ pass }) => {
		assertPassedWith(expectCalledWithArity(createFakeTrackerCalledWithXArguments(0), 0))
		pass()
	},
	"expecting 0 and called with 1": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(1), 0),
			"expect fake tracker to be called without argument but it was called with an unexpected argument"
		)
		pass()
	},
	"expecting 0 and called with 2": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(2), 0),
			"expect fake tracker to be called without argument but it was called with two unexpected arguments"
		)
		pass()
	},
	"expecting 0 and called with 3": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(3), 0),
			"expect fake tracker to be called without argument but it was called with 3 unexpected arguments"
		)
		pass()
	},
	"expecting 1 and called with 0": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(0), 1),
			"expect fake tracker to be called with one argument but it was called without argument"
		)
		pass()
	},
	"expecting 1 and called with 2": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(2), 1),
			"expect fake tracker to be called with one argument but it was called with an extra argument"
		)
		pass()
	},
	"expecting 1 and called with 3": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(3), 1),
			"expect fake tracker to be called with one argument but it was called with two extra arguments"
		)
		pass()
	},
	"expecting 1 and called with 4": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(4), 1),
			"expect fake tracker to be called with one argument but it was called with 3 extra arguments"
		)
		pass()
	},
	"expecting 2 and called with 0": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(0), 2),
			"expect fake tracker to be called with two arguments but it was called without argument"
		)
		pass()
	},
	"expecting 2 and called with 1": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(1), 2),
			"expect fake tracker to be called with two arguments but it was called with only one argument"
		)
		pass()
	},
	"expecting 4 and called with 2": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(2), 4),
			"expect fake tracker to be called with 4 arguments but it was called with only two arguments"
		)
		pass()
	},
	"expecting 4 and called with 3": ({ pass }) => {
		assertFailedWith(
			expectCalledWithArity(createFakeTrackerCalledWithXArguments(3), 4),
			"expect fake tracker to be called with 4 arguments but it was called with only 3 arguments"
		)
		pass()
	},
	"expectCalledOnceWithoutArgument()": ({ pass }) => {
		const spy = createSpy()
		spy()
		assertPassedWith(expectCalledOnceWithoutArgument(spy), [undefined])
		pass()
	},
	"expectCalledTwiceWithoutArgument()": ({ pass }) => {
		const spy = createSpy()
		spy()
		spy()
		assertPassedWith(expectCalledTwiceWithoutArgument(spy), [undefined, undefined])
		pass()
	}
})
