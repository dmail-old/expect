import { expectNumberBelow } from "./expectNumberBelow.js"
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
	"expectNumberBelow 10 with 9": ({ pass }) => {
		assertPassedWith(expectNumberBelow(9, 10))
		pass()
	},
	"expectNumberBelow 10 with 10": ({ pass }) => {
		assertFailedWith(expectNumberBelow(10, 10), "expect a number below 10 but got 10")
		pass()
	},
	"expectNumberBelow 10 with 11": ({ pass }) => {
		assertFailedWith(expectNumberBelow(11, 10), "expect a number below 10 but got 11")
		pass()
	},
	"expectNumberBelow(true, 10)": ({ pass }) => {
		assertFailedWith(
			expectNumberBelow(true, 10),
			"expect a number below 10 but got a boolean: true",
		)
		pass()
	},
})
