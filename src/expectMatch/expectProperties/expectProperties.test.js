import {
	expectProperties,
	expectPropertyNames
	// expectPropertiesAllowingExtra
} from "./expectProperties.js"
import { createTest } from "@dmail/test"
import { matchBelow } from "../expectBelow/expectBelow.js"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.deepEqual(action.getResult(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.deepEqual(action.getResult(), value)
}

export default createTest({
	"expectProperties({}, {foo: true})": ({ pass }) => {
		assertFailedWith(expectProperties({}, { foo: true }), "missing foo property")
		pass()
	},
	"expectProperties({foo: true}, {foo: true})": ({ pass }) => {
		assertPassedWith(expectProperties({ foo: true }, { foo: true }), [undefined])
		pass()
	},
	"expectProperties({foo: true}, {})": ({ pass }) => {
		assertFailedWith(expectProperties({ foo: true }, {}), "unexpected foo property")
		pass()
	},
	"expectProperties({foo: 10}, {foo: matchBelow(5)}": ({ pass }) => {
		assertFailedWith(
			expectProperties({ foo: 10 }, { foo: matchBelow(5) }),
			"foo property mismatch: expect a number below 5 but got 10"
		)
		pass()
	},
	"expectPropertyNames({foo: true}, 'foo')": ({ pass }) => {
		assertPassedWith(expectPropertyNames({ foo: true }, "foo"), [undefined])
		pass()
	}
})
