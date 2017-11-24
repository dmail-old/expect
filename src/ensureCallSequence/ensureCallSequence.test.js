import { expectCalledInOrder } from "./expectCalledInOrder.js"
import { createTest } from "@dmail/test"
import { createSpy } from "@dmail/spy"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export default createTest({
	"when order is respected": ({ pass }) => {
		const firstSpy = createSpy()
		const secondSpy = createSpy()
		firstSpy()
		secondSpy()
		assertPassedWith(expectCalledInOrder(firstSpy, secondSpy), [undefined, undefined])
		pass()
	},
	"when first spy is not called": ({ pass }) => {
		const firstSpy = createSpy("first")
		const secondSpy = createSpy("second")
		assertFailedWith(
			expectCalledInOrder(firstSpy, secondSpy),
			"expect first spy first call to be called"
		)
		pass()
	},
	"when second spy is not called": ({ pass }) => {
		const firstSpy = createSpy("first")
		const secondSpy = createSpy("second")
		firstSpy()
		assertFailedWith(
			expectCalledInOrder(firstSpy, secondSpy),
			"expect second spy first call to be called"
		)
		pass()
	},
	"when order is not respected": ({ pass }) => {
		const firstSpy = createSpy("first")
		const secondSpy = createSpy("second")
		secondSpy()
		firstSpy()
		assertFailedWith(
			expectCalledInOrder(firstSpy, secondSpy),
			"first spy first call must be called before second spy first call"
		)
		pass()
	}
})
