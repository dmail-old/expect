import { createMatcher, getLabelNameAndValue } from "../matcher.js"
import { sequence } from "@dmail/action"
import { createMatcherFrom } from "../createMatcherFrom/createMatcherFrom.js"

export const matchAll = (...args) =>
	createMatcher(actual => {
		const { name, value } = getLabelNameAndValue(actual)
		return sequence(args, arg => {
			return createMatcherFrom(arg)(value).then(null, message => `${name} mismatch: ${message}`)
		})
	})
