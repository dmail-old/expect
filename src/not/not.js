import { createMatcher, createMatcherFrom } from "../matcher.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createNotFailureMessage = (actual, expected) =>
	`unexpected ${uneval(actual)} match on ${uneval(expected)}`

export const matchNot = arg => {
	const matcher = createMatcherFrom(arg)
	return createMatcher(actual =>
		matcher(actual).then(() => failed(createNotFailureMessage(actual, arg)), () => passed()),
	)
}
