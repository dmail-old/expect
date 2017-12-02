import { createMatcherFrom } from "./matcher.js"
import { twoArgumentsSignature } from "./helper.js"

export const expect = twoArgumentsSignature({
	fn: (actual, expected) => createMatcherFrom(expected)(actual),
	createMessage: args => `expected must be called with 2 arguments (${args.length} given)`,
})
