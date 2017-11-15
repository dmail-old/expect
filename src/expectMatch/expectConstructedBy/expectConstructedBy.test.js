import { expectError, expectTypeError, expectErrorWith } from "./expectConstructedBy.js"
import { createMatcher } from "../expectMatch.js"
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
	"expectTypeError on new TypeError()": ({ pass }) => {
		assertPassedWith(expectTypeError(new TypeError()))
		pass()
	},
	"expectErrorWith() matching": ({ pass }) => {
		const message = "foo"
		assertPassedWith(
			expectErrorWith(new Error(message), {
				message
			}),
			[undefined]
		)
		pass()
	},
	"expectErrorWith() with custom matcher": ({ pass }) => {
		const matcher = createMatcher(() => failed(10))
		assertFailedWith(expectErrorWith(new Error(), matcher), "error mismatch: 10")
		pass()
	},
	"expectErrorWith() not matching": ({ pass }) => {
		const message = "foo"
		assertFailedWith(
			expectErrorWith(new Error(message), {
				message: "bar"
			}),
			`error mismatch: message property mismatch: "foo" does not match "bar"`
		)
		pass()
	}
})
