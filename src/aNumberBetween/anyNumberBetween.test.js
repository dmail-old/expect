import { expectAnyNumberBetween } from "./expectAnyNumberBetween.js"
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
	"expectAnyNumberBetween 10, 11 with 10": ({ pass }) => {
		assertFailedWith(
			expectAnyNumberBetween(10, 10, 11),
			"expect a number between 10 and 11 but got 10",
		)
		pass()
	},
	"expectAnyNumberBetween 10, 11 with 11": ({ pass }) => {
		assertFailedWith(
			expectAnyNumberBetween(11, 10, 11),
			"expect a number between 10 and 11 but got 11",
		)
		pass()
	},
	"expectAnyNumberBetween 10, 11 with 10.5": ({ pass }) => {
		assertPassedWith(expectAnyNumberBetween(10.5, 10, 11))
		pass()
	},
	"expectAnyNumberBetween 10, 11 with true": ({ pass }) => {
		assertFailedWith(
			expectAnyNumberBetween(true, 10, 11),
			"expect a number between 10 and 11 but got a boolean: true",
		)
		pass()
	},
})
