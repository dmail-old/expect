import { createMatcherFromFunction } from "../matcher.js"
import { fromPromise } from "@dmail/action"
import { uneval } from "@dmail/uneval"
import { hasProperty } from "../helper.js"
import {
	createBehaviourFactory,
	oneAllowedBehaviourSignature,
	isBehaviourOf,
} from "../behaviour.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

export const willResolveWith = createBehaviourFactory("willResolveWith")

export const willRejectWith = createBehaviourFactory("willRejectWith")

export const aThenableWhich = oneAllowedBehaviourSignature(
	[willResolveWith, willRejectWith],
	(behaviour) => {
		const expectedToResolve = isBehaviourOf(willResolveWith, behaviour)

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
					(value) => {
						if (expectedToResolve === false) {
							return fail(`unexpected resolve with ${uneval(value)} on thenable`)
						}
						return expected(value).then(null, (message) => {
							return `resolved value mismatch: ${message}`
						})
					},
					(reason) => {
						if (expectedToResolve) {
							return fail(`unexpected reject with ${uneval(reason)} on thenable`)
						}
						return expected(reason).then(null, (message) => {
							return `rejected value mismatch: ${message}`
						})
					},
				)
				.then((meta) => expected(meta))
		})(behaviour)
	},
)
