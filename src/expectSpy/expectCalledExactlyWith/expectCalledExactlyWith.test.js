import {
	expectCalledExactlyWith,
	expectCalledOnceWith,
	expectCalledTwiceWith
} from "./expectCalledExactlyWith.js"
import { createTest } from "@dmail/test"
import { createSpy } from "@dmail/spy"
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
	"when called with the expected values": ({ pass }) => {
		const spy = createSpy()
		const args = [0, 1]
		spy(...args)
		spy(...args)
		assertPassedWith(expectCalledExactlyWith(spy, 2, ...args), [
			[undefined, undefined],
			[undefined, undefined]
		])
		pass()
	},
	"when first called contains unexpected value": ({ pass }) => {
		const spy = createSpy()
		const args = [0, 1]
		spy(0, 2)
		spy(...args)
		assertFailedWith(
			expectCalledExactlyWith(spy, 2, ...args),
			"anonymous spy first call second argument mismatch: 2 does not match 1"
		)
		pass()
	},
	"expectCalledOnceWith()": ({ pass }) => {
		const spy = createSpy()
		spy(1)
		assertPassedWith(expectCalledOnceWith(spy, 1), [[undefined]])
		pass()
	},
	"expectCalledTwiceWith()": ({ pass }) => {
		const spy = createSpy()
		spy(1)
		spy(1)
		assertPassedWith(expectCalledTwiceWith(spy, 1), [[undefined], [undefined]])
		pass()
	}
})
