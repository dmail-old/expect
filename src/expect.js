import { failed } from "@dmail/action"
import { matchAll } from "./matcher.js"

export const expect = (...args) => {
	if (args.length < 2) {
		return failed(`expect must be called with at least 2 arguments (${args.length} given)`)
	}
	const [value, ...remainingArgs] = args
	return matchAll(...remainingArgs)(value)
}
