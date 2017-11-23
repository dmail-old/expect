import { createMatcher, match, createExpectFromMatcher } from "../helper.js"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

export const matchNot = expected =>
	createMatcher(actual =>
		match(expected)(actual).then(
			() => failed(`${uneval(actual)} matching ${uneval(expected)}`),
			() => passed(),
		),
	)
export const expectNot = createExpectFromMatcher(matchNot)
