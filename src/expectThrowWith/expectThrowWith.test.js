import { expectThrowWith } from "./expectThrowWith.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { matchProperties } from "../expectMatch/index.js"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export default createTest({
	"throw the expected exception": ({ pass }) => {
		const message = "foo"
		assertPassedWith(
			expectThrowWith(
				() => {
					throw new Error(message)
				},
				matchProperties({
					message
				})
			),
			[undefined]
		)
		pass()
	},
	"throw an unexpected exception": ({ pass }) => {
		const message = "foo"
		const unexpectedMessage = "bar"
		assertFailedWith(
			expectThrowWith(
				() => {
					throw new Error(message)
				},
				matchProperties({
					message: unexpectedMessage
				})
			),
			`throwed exception mismatch: message property mismatch: "foo" does not match "bar"`
		)
		pass()
	},
	"does not throw": ({ pass }) => {
		assertFailedWith(expectThrowWith(() => {}, "something"), "missing throw")
		pass()
	}
})
