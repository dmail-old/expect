import { anyNumberAbove } from "./anyNumberAbove.js"
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

export default createTest({
	"anyNumberAbove(10, 9)": ({ pass }) => {
		assertFailedWith(anyNumberAbove(10)(9), "expect a number above 10 but got 9")
		pass()
	},
	"anyNumberAbove(10)(10)": ({ pass }) => {
		assertFailedWith(anyNumberAbove(10)(10), "expect a number above 10 but got 10")
		pass()
	},
	"anyNumberAbove(10, 11)": ({ pass }) => {
		assertPassedWith(anyNumberAbove(10)(11))
		pass()
	},
	"anyNumberAbove(10)(true)": ({ pass }) => {
		assertFailedWith(anyNumberAbove(10)(true), "expect a number above 10 but got a boolean: true")
		pass()
	},
})
