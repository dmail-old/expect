import { is } from "./is.js"
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

export const test = createTest({
	"is with 0, 0": ({ pass }) => {
		assertPassedWith(is(0)(0))
		pass()
	},
	"is with true, false": ({ pass }) => {
		assertFailedWith(
			is(true)(false),
			`actual is:
true

when expecting:
false
`,
		)
		pass()
	},
})
