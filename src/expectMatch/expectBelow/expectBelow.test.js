import { expectBelow } from "./expectBelow.js"
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
	"expectBelow 10 with 9": ({ pass }) => {
		assertPassedWith(expectBelow(9, 10))
		pass()
	},
	"expectBelow 10 with 10": ({ pass }) => {
		assertFailedWith(expectBelow(10, 10), "expect value below 10 but got 10")
		pass()
	},
	"expectBelow 10 with 11": ({ pass }) => {
		assertFailedWith(expectBelow(11, 10), "expect value below 10 but got 11")
		pass()
	},
	"expectAbove(true, 10)": ({ pass }) => {
		assertFailedWith(expectBelow(true, 10), "expect value below 10 but got a boolean: true")
		pass()
	}
})
