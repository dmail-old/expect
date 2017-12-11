import { constructedBy } from "./constructedBy.js"
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
	"any(undefined)()": ({ pass }) => {
		assertPassedWith(constructedBy(undefined)({}))
		pass()
	},
	"any(CustomConstructor)(new CustomConstructor)": ({ pass }) => {
		assertPassedWith(constructedBy(CustomConstructor)(new CustomConstructor()))
		pass()
	},
	"any(CustomConstructor)(Object.create(null))": ({ pass }) => {
		assertFailedWith(
			constructedBy(CustomConstructor)(Object.create(null)),
			"expect a customConstructor but got an object",
		)
		pass()
	},
	"any(Object) with an anonymous constructor": ({ pass }) => {
		const objectWithAnonymousConstructor = {}
		objectWithAnonymousConstructor.constructor = function() {}
		assertPassedWith(constructedBy(Object)(objectWithAnonymousConstructor))
		pass()
	},
})
