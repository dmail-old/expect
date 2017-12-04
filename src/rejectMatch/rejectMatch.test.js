import { rejectMatch } from "./rejectMatch.js"
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
		},
	)
}

const createResolvedThenable = value => ({
	then: onResolve => {
		setTimeout(onResolve, 0, value)
	},
})

const createRejectedThenable = value => ({
	then: (onResolve, onReject) => {
		setTimeout(onReject, 0, value)
	},
})

export const test = createTest({
	"reject to unexpected value": () => {
		const value = 1
		const unexpectedValue = 2
		return assertAfter(
			() => rejectMatch(value)(createRejectedThenable(unexpectedValue)),
			action => assertFailedWith(action, `expect thenable rejected value to match ${value}`),
		)
	},
	// "resolve instead of reject": () => {
	// 	const value = 1
	// 	const resolvedValue = 2
	// 	return assertAfter(
	// 		() => rejectMatch(value)(createResolvedThenable(resolvedValue)),
	// 		action =>
	// 			assertFailedWith(action, `expect thenable to reject but it resolved with ${resolvedValue}`),
	// 	)
	// },
	// "reject to the expected value": () => {
	// 	const value = 1
	// 	return assertAfter(
	// 		() => rejectMatch(value)(createRejectedThenable(value)),
	// 		action => assertPassedWith(action),
	// 	)
	// },
})
