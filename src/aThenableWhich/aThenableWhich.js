import { createMatcherFromFunction } from "../matcher.js"
import { fromPromise, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { hasProperty } from "../helper.js"
import { oneAllowedBehaviourSignature } from "../behaviourSignature.js"
import { any, prefixValue } from "../any/any.js"

export const resolveWith = createMatcherFromFunction(({ expected, actual, fail }) => {
	const { status, value } = actual
	if (status === "rejected") {
		return fail(`unexpected reject with ${uneval(value)} on thenable`)
	}
	return expected(value).then(null, message => {
		return `resolved value mismatch: ${message}`
	})
})

export const rejectWith = createMatcherFromFunction(({ expected, actual, fail }) => {
	const { status, value } = actual
	if (status === "resolved") {
		return fail(`unexpected resolve with ${uneval(value)} on thenable`)
	}
	return expected(value).then(null, message => {
		return `rejected value mismatch: ${message}`
	})
})

export const aThenableWhich = oneAllowedBehaviourSignature(
	[resolveWith, rejectWith, any],
	behaviour => {
		return createMatcherFromFunction(({ expected, actual, fail }) => {
			if (actual === null || (typeof actual !== "object" && typeof actual !== "function")) {
				return fail(`expect a thenable but got ${prefixValue(actual)}`)
			}

			if (hasProperty(actual, "then") === false) {
				return fail(`expect a thenable but value is missing a then property`)
			}

			const then = actual.then
			if (typeof then !== "function") {
				return fail(`expect a thenable then method to be a function but got ${prefixValue(then)}`)
			}

			return fromPromise(actual)
				.then(
					value => ({
						status: "resolved",
						value,
					}),
					reason =>
						passed({
							status: "rejected",
							value: reason,
						}),
				)
				.then(meta => expected(meta))
		})(behaviour)
	},
)
