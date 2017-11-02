import { expectRejectWith } from "./expectRejectWith.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { passed } from "@dmail/action"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

const assertAfter = (fn, ensure) => {
	const action = fn()
	return action.then(
		value => {
			ensure(action, value)
		},
		reason => {
			ensure(action, reason)
			return passed()
		}
	)
}

const createResolvedThenable = value => ({
	then: onResolve => {
		setTimeout(onResolve, 0, value)
	}
})
const createRejectedThenable = value => ({
	then: (onResolve, onReject) => {
		setTimeout(onReject, 0, value)
	}
})

export default createTest({
	"reject to the expected value": () => {
		const value = 1
		return assertAfter(
			() => expectRejectWith(createRejectedThenable(value), value),
			action => assertPassedWith(action)
		)
	},
	"reject to unexpected value": () => {
		const value = 1
		const unexpectedValue = 2
		return assertAfter(
			() => expectRejectWith(createRejectedThenable(unexpectedValue), value),
			action =>
				assertFailedWith(
					action,
					`thenable rejected value mismatch: ${unexpectedValue} does not match ${value}`
				)
		)
	},
	"resolve instead of reject": () => {
		const value = 1
		const resolvedValue = 2
		return assertAfter(
			() => expectRejectWith(createResolvedThenable(resolvedValue), value),
			action =>
				assertFailedWith(action, `thenable expected to reject resolved with ${resolvedValue}`)
		)
	}
})
