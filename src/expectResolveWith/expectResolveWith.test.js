import { expectResolveWith } from "./expectResolveWith.js"
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

export default createTest({
	"resolved to the expected value": () => {
		const value = 1
		return assertAfter(
			() => expectResolveWith(Promise.resolve(value), value),
			action => assertPassedWith(action)
		)
	},
	"resolved to unexpected value": () => {
		const value = 1
		const unexpectedValue = 2
		return assertAfter(
			() => expectResolveWith(Promise.resolve(unexpectedValue), value),
			action =>
				assertFailedWith(
					action,
					`thenable resolved value mismatch: ${unexpectedValue} does not match ${value}`
				)
		)
	},
	"rejecting instead of resolving": () => {
		const value = 1
		const rejectedValue = 2
		const rejectedThenable = {
			then: (onResolve, onReject) => {
				setTimeout(onReject, 0, rejectedValue)
			}
		}
		return assertAfter(
			() => expectResolveWith(rejectedThenable, value),
			action =>
				assertFailedWith(action, `thenable expected to resolve rejected with ${rejectedValue}`)
		)
	}
})
