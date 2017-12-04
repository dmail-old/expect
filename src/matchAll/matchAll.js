import { createMatcherFromFunction } from "../matcher.js"
import { sequence } from "@dmail/action"
// import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

export const matchAll = (...args) => {
	// const matchers = args.map(arg => createMatcherFrom(arg))
	const matchers = args
	return createMatcherFromFunction(({ trace, expected }) => {
		return sequence(matchers, matcher => matcher(expected)(trace))
	})
}
