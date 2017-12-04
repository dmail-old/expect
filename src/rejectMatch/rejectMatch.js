import { createMatcher, createMatcherFromFunction, createMatcherDiscovering } from "../matcher.js"
// import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"
import { exactly } from "../exactly/exactly.js"
// import { anyThenable } from "../anyThenable/anyThenable.js"
import { matchAll } from "../matchAll/matchAll.js"
import { fromPromise, passed } from "@dmail/action"

// const matchThenable = anyThenable()

export const rejectMatch = createMatcher({
	name: "rejectMatch",
	valueName: "thenable",
	match: () => {
		return matchAll(
			// matchThenable,
			createMatcherDiscovering(
				actual => {
					return fromPromise(actual).then(
						value => ({
							name: "resolved value",
							value,
						}),
						reason =>
							passed({
								name: "rejected value",
								value: reason,
							}),
					)
				},
				createMatcherFromFunction(({ trace, fail }) => {
					if (trace.getName() === "resolved value") {
						return fail({ type: "unexpected-resolved-value" })
					}
					debugger
					return exactly
				}),
			),
		)
	},
})
