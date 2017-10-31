import { expectCalledWith } from "./expectCalledWith.js"
import { createTest } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.deepEqual(action.getResult(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.deepEqual(action.getResult(), value)
}

const createFakeTrackerCalledWith = (...args) => ({
	toString: () => "fake tracker",
	createReport: () => ({
		called: true,
		argValues: args
	})
})

export default createTest({
	"when called with the expected values": ({ pass }) => {
		const args = [0, 1]
		assertPassedWith(
			expectCalledWith(createFakeTrackerCalledWith(...args), ...args),
			args.map(() => undefined)
		)
		pass()
	},
	"when first arg does not match": ({ pass }) => {
		assertFailedWith(
			expectCalledWith(createFakeTrackerCalledWith(0), 1),
			"fake tracker first argument mismatch: 0 does not match 1"
		)
		pass()
	},
	"when second arg does not match": ({ pass }) => {
		assertFailedWith(
			expectCalledWith(createFakeTrackerCalledWith(0, 0), 0, 1),
			"fake tracker second argument mismatch: 0 does not match 1"
		)
		pass()
	},
	"when third arg does not match": ({ pass }) => {
		assertFailedWith(
			expectCalledWith(createFakeTrackerCalledWith(0, 0, 0), 0, 0, 1),
			"fake tracker third argument mismatch: 0 does not match 1"
		)
		pass()
	},
	"when fourth arg does not match": ({ pass }) => {
		assertFailedWith(
			expectCalledWith(createFakeTrackerCalledWith(0, 0, 0, 0), 0, 0, 0, 1),
			"fake tracker argument n°3 mismatch: 0 does not match 1"
		)
		pass()
	}
})
