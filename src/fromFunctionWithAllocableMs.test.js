import { test } from "./test.js"
import { fromFunctionWithAllocableMs } from "./fromFunctionWithAllocableMs.js"

// le truc c'est qu'ici il faudrais mock setTimeout, c'est chiant

test("fromFunctionWithAllocableMs.js", ({ waitUntil, assert }) => {
	const done = waitUntil()

	const actionPassedQuickly = fromFunctionWithAllocableMs(({ pass, allocateMs }) => {
		allocateMs(1)
		pass()
	})
	assert.equal(actionPassedQuickly.getState(), "passed")

	const failedValue = 2
	const actionFailedQuickly = fromFunctionWithAllocableMs(({ fail, allocateMs }) => {
		allocateMs(1)
		fail(failedValue)
	})
	assert.equal(actionFailedQuickly.getState(), "failed")
	assert.equal(actionFailedQuickly.getResult(), failedValue)

	const tooLongAction = fromFunctionWithAllocableMs(
		({ allocateMs, getAllocatedMs, getConsumedMs, getRemainingMs }) => {
			assert.equal(getConsumedMs(), undefined)
			assert.equal(getRemainingMs(), Infinity)

			assert.equal(getAllocatedMs(), Infinity)
			allocateMs(-1)
			assert.equal(getAllocatedMs(), Infinity)
			allocateMs(-2)
			assert.equal(getAllocatedMs(), Infinity)

			allocateMs(1)

			assert.equal(getConsumedMs(), 0)
			assert.equal(getRemainingMs(), 1)
		}
	)
	setTimeout(() => {
		assert.equal(tooLongAction.getState(), "failed")
		assert.equal(tooLongAction.getResult(), `must pass or fail in less than 1ms`)
		done()
	}, 20)
})
