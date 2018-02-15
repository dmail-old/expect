import { createMatcher } from "../matcher.js"
import { sequence } from "@dmail/action"
import { createAssertionFrom } from "../createAssertionFrom/createAssertionFrom.js"

export const matchAll = (...args) => {
	const assertions = args.map(arg => createAssertionFrom(arg))
	// const matchers = args
	return createMatcher({
		match: ({ actual }) => sequence(assertions, assertion => assertion(actual)),
	})
}
