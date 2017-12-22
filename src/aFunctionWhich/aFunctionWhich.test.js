import { aFunctionWhich } from "./aFunctionWhich.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { willReturnWith } from "./willReturnWith"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

// const assertFailedWith = (action, value) => {
// 	assert.deepEqual(action.getResult(), value)
// 	assert.equal(action.getState(), "failed")
// }

export const test = createTest({
	"aFunctionWhich returnWith null": ({ pass }) => {
		const behaviour = willReturnWith(null)
		const assertion = aFunctionWhich(behaviour)
		const fn = () => null
		assertPassedWith(assertion(fn))
		pass()
	},
})
