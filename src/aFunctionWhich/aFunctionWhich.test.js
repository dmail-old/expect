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

export const test = createTest({
	"aFunctionWhich returnWith null": ({ pass }) => {
		const assertion = aFunctionWhich(willReturnWith(null))
		const fn = () => null
		assertPassedWith(assertion(fn))
		pass()
	},

	"aFunctionWhich returnWith null but return with undefined": ({ pass }) => {
		const assertion = aFunctionWhich(willReturnWith(null))
		const fn = () => undefined
		assertFailedWith(
			assertion(fn),
			`unexpected fn function return value:
actual is

undefined

when expecting

null
`,
		)
		pass()
	},
})
