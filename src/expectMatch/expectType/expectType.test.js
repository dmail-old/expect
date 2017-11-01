import {
	expectType,
	expectFunction,
	expectObject,
	expectNumber,
	expectString,
	prefix
} from "./expectType.js"
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
	"prefix(null)": ({ pass }) => {
		assert.equal(prefix("null"), "null")
		pass()
	},
	"prefix(undefined)": ({ pass }) => {
		assert.equal(prefix("undefined"), "undefined")
		pass()
	},
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
	},
	"expectString('foo', 'foo')": ({ pass }) => {
		assertPassedWith(expectString("foo", "foo"))
		pass()
	},
	"expectString('foo', 'bar')": ({ pass }) => {
		assertFailedWith(expectString("foo", "bar"), `"foo" does not match "bar"`)
		pass()
	}
})
