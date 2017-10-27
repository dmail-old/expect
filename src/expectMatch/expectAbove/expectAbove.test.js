import { expectAbove } from "./expectAbove.js"
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

export default createTest({
	"expectAbove(9, 10)": ({ pass }) => {
		assertFailedWith(expectAbove(9, 10), "expect value above 10 but got 9")
		pass()
	},
	"expectAbove(10, 10)": ({ pass }) => {
		assertFailedWith(expectAbove(10, 10), "expect value above 10 but got 10")
		pass()
	},
	"expectAbove(11, 10)": ({ pass }) => {
		assertPassedWith(expectAbove(11, 10))
		pass()
	},
	"expectAbove(true, 10)": ({ pass }) => {
		assertFailedWith(expectAbove(true, 10), "expect value above 10 but got a boolean: true")
		pass()
	}
})
