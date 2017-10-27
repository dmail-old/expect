import {
	expectType,
	expectFunction,
	expectObject,
	expectNumber,
	expectString
} from "./expectType.js"
import { createTest } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.equal(action.getResult().valueOf(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.equal(action.getResult().toString(), value)
}

export default createTest({
	"expectType(10, 'string')": ({ pass }) => {
		assertFailedWith(expectType(10, "string"), "expect a string but got a number")
		pass()
	},
	"expectType('foo', 'string')": ({ pass }) => {
		assertPassedWith(expectType("foo", "string"))
		pass()
	},
	"expectFunction(true)": ({ pass }) => {
		assertFailedWith(expectFunction(true), "expect a function but got a boolean")
		pass()
	},
	"expectFunction(() => {})": ({ pass }) => {
		assertPassedWith(expectFunction(() => {}))
		pass()
	},
	"expectObject({})": ({ pass }) => {
		assertPassedWith(expectObject({}))
		pass()
	},
	"expectNumber(10)": ({ pass }) => {
		assertPassedWith(expectNumber(10))
		pass()
	},
	"expectString('')": ({ pass }) => {
		assertPassedWith(expectString(""))
		pass()
	}
})
