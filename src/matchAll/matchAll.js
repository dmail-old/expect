import { createMatcher } from "../matcher.js"
import { sequence } from "@dmail/action"
import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

export const matchAll = (...args) =>
	createMatcher(({ actual }) => {
		return sequence(args, arg => createMatcherFrom(arg)(actual))
	})
