import { same } from "./same.js"
import { createTest } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export const test = createTest({
	"same with 0, 0": ({ pass }) => {
		assertPassedWith(same(0)(0))
		pass()
	},
	"same with null, true": ({ pass }) => {
		assertFailedWith(same(null)(true), "expect null but got true")
		pass()
	},
	"same with undefined, false": ({ pass }) => {
		assertFailedWith(same(undefined)(false), "expect undefined but got false")
		pass()
	},
	"same with {}, true": ({ pass }) => {
		assertFailedWith(same({})(true), "expect an object but got a boolean")
		pass()
	},
	"same with {}, {}": ({ pass }) => {
		assertPassedWith(same({})({}))
		pass()
	},
	"same with [], {}": ({ pass }) => {
		assertFailedWith(same([])({}), "expect an array but got an object")
		pass()
	},
})
