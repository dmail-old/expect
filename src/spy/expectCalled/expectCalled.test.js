import { expectCalled } from "./expectCalled.js"
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
	"on tracker returning it's called": ({ pass }) => {
		assertPassedWith(
			expectCalled({
				createReport: () => ({
					called: true
				})
			})
		)
		pass()
	},
	"on tracker returning it's not called": ({ pass }) => {
		const toStringReturnValue = "tracker"
		assertFailedWith(
			expectCalled({
				toString: () => toStringReturnValue,
				createReport: () => ({
					called: false
				})
			}),
			`expect ${toStringReturnValue} to be called`
		)
		pass()
	}
})
