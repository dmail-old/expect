import { expectNumberAbove } from "./expectNumberAbove.js"
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
	"expectNumberAbove(9, 10)": ({ pass }) => {
		assertFailedWith(expectNumberAbove(9, 10), "expect a number above 10 but got 9")
		pass()
	},
	"expectNumberAbove(10, 10)": ({ pass }) => {
		assertFailedWith(expectNumberAbove(10, 10), "expect a number above 10 but got 10")
		pass()
	},
	"expectNumberAbove(11, 10)": ({ pass }) => {
		assertPassedWith(expectNumberAbove(11, 10))
		pass()
	},
	"expectNumberAbove(true, 10)": ({ pass }) => {
		assertFailedWith(
			expectNumberAbove(true, 10),
			"expect a number above 10 but got a boolean: true",
		)
		pass()
	},
})
