import { aFunctionWhich } from "./aFunctionWhich.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { willReturnWith } from "./willReturnWith"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export default createTest({
	"throw the expected exception": ({ pass }) => {
		assertPassedWith(aFunctionWhich(willReturnWith(null))(() => null))
		pass()
	},
})