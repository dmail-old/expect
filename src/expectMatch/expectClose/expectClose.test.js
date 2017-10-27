import { expectClose } from "./expectClose.js"
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
	"expectClose(10, 9)": ({ pass }) => {
		assertPassedWith(expectClose(9, 10))
		pass()
	},
	"expectClose(10, 10)": ({ pass }) => {
		assertPassedWith(expectClose(10, 10))
		pass()
	},
	"expectClose(10, 11)": ({ pass }) => {
		assertPassedWith(expectClose(11, 10))
		pass()
	},
	"expectClose(9, 10, 0)": ({ pass }) => {
		assertFailedWith(expectClose(9, 10, 0), "expect a number close to 10 (+/-0) but got 9")
		pass()
	},
	"expectClose(10, 10, 0)": ({ pass }) => {
		assertPassedWith(expectClose(10, 10, 0))
		pass()
	},
	"expectClose(11, 10, 0)": ({ pass }) => {
		assertFailedWith(expectClose(11, 10, 0), "expect a number close to 10 (+/-0) but got 11")
		pass()
	},
	"expectClose(true, 10, 0)": ({ pass }) => {
		assertFailedWith(
			expectClose(true, 10, 0),
			"expect a number close to 10 (+/-0) but got a boolean: true"
		)
		pass()
	}
})
