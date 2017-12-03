import { createMatcher } from "../matcher.js"
import { oneArgumentSignature } from "../helper.js"
// import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"
import { exactly } from "../exactly/exactly.js"
// import { anyThenable } from "../anyThenable/anyThenable.js"
// import { matchAll } from "../matchAll/matchAll.js"

// const matchThenable = anyThenable()

const unexpectedResolvedValue = createMatcher(({ fail }) => {
	fail({ type: "unexpected-resolved-value" })
})()

export const rejectMatch = oneArgumentSignature({
	fn: createMatcher(
		({ expected, compose }) => {
			const expectReject = createMatcher(({ actual, composeDiscovering }) => {
				actual.then(
					value =>
						setTimeout(() => {
							composeDiscovering("resolved value", value, unexpectedResolvedValue)
						}),
					value =>
						setTimeout(() => {
							composeDiscovering("rejected value", value, exactly(expected))
						}),
				)
			})()
			compose(expectReject)

			// match(
			// 	matchAll(
			// 		matchThenable,
			// 		matchReject
			// 	)
			// )
		},
		{
			defaultName: "thenable",
		},
	),
	createMessage: () =>
		`rejectMatch must be called with one argument, you can use rejectMatch(any())`,
})
