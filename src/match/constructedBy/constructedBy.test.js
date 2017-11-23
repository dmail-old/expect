import { expectAnyError, expectAnyTypeError } from "./expectConstructedBy.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { failed } from "@dmail/action"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export default createTest({
	"expectError on new Error()": ({ pass }) => {
		assertPassedWith(expectAnyError(new Error()))
		pass()
	},
	"expectError on new TypeError()": ({ pass }) => {
		assertFailedWith(
			expectAnyError(new TypeError()),
			"expect value constructed by Error but got TypeError",
		)
		pass()
	},
	"expectError matching": ({ pass }) => {
		const error = new Error()
		assertPassedWith(expectAnyError(error, error))
		pass()
	},
	"expectError not matching": ({ pass }) => {
		const error = new Error()
		assertFailedWith(expectAnyError(error, null), `Error("") does not match null`)
		pass()
	},
	"expectTypeError on new TypeError()": ({ pass }) => {
		assertPassedWith(expectAnyTypeError(new TypeError()))
		pass()
	},
})
