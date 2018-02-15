import { aNumberAbove } from "./aNumberAbove.js"
import { plan } from "@dmail/test"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export const test = plan("aNumberAbove", ({ test }) => {
	test("anyNumberAbove(10, 9)", () => {
		assertFailedWith(
			aNumberAbove(10)(9),
			`actual:
9

expected:
a number above 10
`,
		)
	})

	test("anyNumberAbove(10)(10)", () => {
		assertFailedWith(
			aNumberAbove(10)(10),
			`actual:
10

expected:
a number above 10
`,
		)
	})

	test("anyNumberAbove(10, 11)", () => {
		assertPassedWith(aNumberAbove(10)(11))
	})

	test("anyNumberAbove(10)(true)", () => {
		assertFailedWith(
			aNumberAbove(10)(true),
			`actual:
true

expected:
a number above 10
`,
		)
	})
})
