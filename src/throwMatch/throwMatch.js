import { createMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { oneArgumentSignature } from "../helper.js"
import { matchAll } from "../matchAll/matchAll.js"

const matchFunction = any(Function)

export const throwMatch = oneArgumentSignature({
	fn: createMatcher(({ match }) => {
		match(
			matchAll(
				matchFunction,
				createMatcher(({ expected, actual }) => {
					let throwed = false
					let throwedValue

					try {
						actual.getValue()
					} catch (e) {
						throwed = true
						throwedValue = e
					}

					const { fail, match } = actual.trace(throwedValue, "throw")

					if (throwed) {
						return match(expected)
					}
					return fail({ type: "missing-throw" })
				}),
			),
		)
	}),
	createMessage: () =>
		`throwMatch() must be called with one argument, you can use throwMatch(any())`,
})
