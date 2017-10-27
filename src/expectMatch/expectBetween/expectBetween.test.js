import { expectBetween } from "./expectBetween.js"
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
	"expectBetween 10, 11 with 10": ({ pass }) => {
		assertFailedWith(expectBetween(10, 10, 11), "expect value between 10 and 11 but got 10")
		pass()
	},
	"expectBetween 10, 11 with 11": ({ pass }) => {
		assertFailedWith(expectBetween(11, 10, 11), "expect value between 10 and 11 but got 11")
		pass()
	},
	"expectBetween 10, 11 with 10.5": ({ pass }) => {
		assertPassedWith(expectBetween(10.5, 10, 11))
		pass()
	},
	"expectBeeetwen 10, 11 with true": ({ pass }) => {
		assertFailedWith(
			expectBetween(true, 10, 11),
			"expect value between 10 and 11 but got a boolean: true"
		)
		pass()
	}
})
