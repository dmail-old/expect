import { expectCalledExactly, expectNotCalled } from "./expectCalledExactly.js"
import { createTest } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.equal(action.getResult(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.equal(action.getResult(), value)
}

const createFakeSpyCalled = count => ({
	toString: () => "fakeSpy",
	getCallCount: () => count
})

export default createTest({
	"when called 0 and expecting 0": ({ pass }) => {
		assertPassedWith(expectCalledExactly(createFakeSpyCalled(0), 0))
		pass()
	},
	"when called 1 and expecting 0": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(1), 0),
			`do not expect fakeSpy to be called but it was called once`
		)
		pass()
	},
	"when called 2 and expecting 0": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(2), 0),
			`do not expect fakeSpy to be called but it was called twice`
		)
		pass()
	},
	"when called 3 and expecting 0": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(3), 0),
			`do not expect fakeSpy to be called but it was called 3 times`
		)
		pass()
	},
	"when called 0 and expecting 1": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(0), 1),
			`expect fakeSpy to be called once but it was never called`
		)
		pass()
	},
	"when called 0 and expecting 2": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(0), 2),
			`expect fakeSpy to be called twice but it was never called`
		)
		pass()
	},
	"when called 0 and expecting 3": ({ pass }) => {
		assertFailedWith(
			expectCalledExactly(createFakeSpyCalled(0), 3),
			`expect fakeSpy to be called exactly 3 times but it was never called`
		)
		pass()
	},
	"epectNotCalled()": ({ pass }) => {
		assertPassedWith(expectNotCalled(createFakeSpyCalled(0)))
		pass()
	}
})
