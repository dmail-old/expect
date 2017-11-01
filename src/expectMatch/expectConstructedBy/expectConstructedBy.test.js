import { expectError, expectTypeError } from "./expectConstructedBy.js"
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
	"expectError on new Error()": ({ pass }) => {
		assertPassedWith(expectError(new Error()))
		pass()
	},
	"expectError on new TypeError()": ({ pass }) => {
		assertFailedWith(
			expectError(new TypeError()),
			"expect value constructed by Error but got TypeError"
		)
		pass()
	},
	"expectError matching": ({ pass }) => {
		const error = new Error()
		assertPassedWith(expectError(error, error))
		pass()
	},
	"expectError not matching": ({ pass }) => {
		const error = new Error()
		assertFailedWith(expectError(error, null), `Error("") does not match null`)
		pass()
	},
	"expectTypeError on new TypeError()": ({ pass }) => {
		assertPassedWith(expectTypeError(new TypeError()))
		pass()
	}
})
