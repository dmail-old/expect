import { any } from "./any.js"
import { createTest } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

const CustomConstructor = function() {}

export default createTest({
	"any()() must pass": ({ pass }) => {
		assertPassedWith(any()())
		pass()
	},
	"any()(undefined) must pass": ({ pass }) => {
		assertPassedWith(any()(undefined))
		pass()
	},
	"any()({}) must pass": ({ pass }) => {
		assertPassedWith(any()({}))
		pass()
	},
	"any(undefined)()": ({ pass }) => {
		assertPassedWith(any(undefined)({}))
		pass()
	},
	"any(CustomConstructor)(new CustomConstructor)": ({ pass }) => {
		assertPassedWith(any(CustomConstructor)(new CustomConstructor()))
		pass()
	},
	"any(CustomConstructor)(Object.create(null))": ({ pass }) => {
		assertFailedWith(
			any(CustomConstructor)(Object.create(null)),
			"expect a customConstructor but got an object",
		)
		pass()
	},
	"any(Object) with an anonymous constructor": ({ pass }) => {
		const objectWithAnonymousConstructor = {}
		objectWithAnonymousConstructor.constructor = function() {}
		assertPassedWith(any(Object)(objectWithAnonymousConstructor))
		pass()
	},
})
