import { aFunctionWhich } from "./aFunctionWhich.js"
import { willReturnWith } from "./willReturnWith.js"
import { willCallSpyWith } from "./willCallSpyWith.js"
import { plan } from "@dmail/test"
import assert from "assert"
import { createSpy } from "@dmail/spy"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export const test = plan("aFunctionWhich", ({ scenario, test }) => {
	scenario("returnWith", () => {
		test("returnWith null", () => {
			const assertion = aFunctionWhich(willReturnWith(null))
			const fn = () => null
			assertPassedWith(assertion(fn))
		})

		test("returnWith null but return with undefined", () => {
			const assertion = aFunctionWhich(willReturnWith(null))
			const fn = () => undefined
			assertFailedWith(
				assertion(fn),
				`unexpected fn function return value:
actual:
undefined

expected:
null
`,
			)
		})
	})

	scenario("willCallSpyWith", () => {
		test("willCallSpyWith 0, 1", () => {
			const spy = createSpy("spy")
			const fn = () => spy(0, 1)
			const assertion = aFunctionWhich(willCallSpyWith(spy, 0, 1))
			assertPassedWith(assertion(fn))
		})

		test("willCallSpyWith 0, 1 and extra call", () => {
			const spy = createSpy("test")
			const fn = () => {
				spy(0, 1)
				spy("foo", "bar")
				spy("beee")
			}
			const assertion = aFunctionWhich(willCallSpyWith(spy, 0, 1))
			assertFailedWith(
				assertion(fn),
				`2 extra call to test spy:
[
	"foo",
	"bar"
]

[
	"beee"
]
`,
			)
		})
	})
})
