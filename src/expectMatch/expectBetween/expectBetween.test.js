import { expectAbove, expectBelow, expectBetween } from "./expectBetween.js"
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
	"expectAbove 10 with 9": ({ pass }) => {
		assertFailedWith(expectAbove(9, 10), "expect value above 10 but got 9")
		pass()
	},
	"expectAbove 10 with 10": ({ pass }) => {
		assertFailedWith(expectAbove(10, 10), "expect value above 10 but got 10")
		pass()
	},
	"expectAbove 10 with 11": ({ pass }) => {
		assertPassedWith(expectAbove(11, 10))
		pass()
	},
	"expectBelow 10 with 9": ({ pass }) => {
		assertPassedWith(expectBelow(9, 10))
		pass()
	},
	"expectBelow 10 with 10": ({ pass }) => {
		assertFailedWith(expectBelow(10, 10), "expect value below 10 but got 10")
		pass()
	},
	"expectBelow 10 with 11": ({ pass }) => {
		assertFailedWith(expectBelow(11, 10), "expect value below 10 but got 11")
		pass()
	},
	"expectBetween 10, 11 with 10": ({ pass }) => {
		assertFailedWith(expectBetween(10, 10, 11), "expect value above 10 but got 10")
		pass()
	},
	"expectBetween 10, 11 with 11": ({ pass }) => {
		assertFailedWith(expectBetween(11, 10, 11), "expect value below 11 but got 11")
		pass()
	},
	"expectBetween 10, 11 with 10.5": ({ pass }) => {
		assertPassedWith(expectBetween(10.5, 10, 11))
		pass()
	},
	"expectBeeetwen 10, 11 with true": ({ pass }) => {
		assertFailedWith(expectBetween(true, 10, 11), "expect a number but got a boolean")
		pass()
	}
})
