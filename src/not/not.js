import { createMatcher, isMatcher } from "../match.js"
import { failed, passed } from "@dmail/action"
import { strictEqual } from "../strictEqual/strictEqual.js"
import { uneval } from "@dmail/uneval"

export const matchNot = arg => {
	const matcher = isMatcher(arg) ? arg : strictEqual(arg)
	return createMatcher(actual =>
		matcher(actual).then(() => failed(`${uneval(actual)} matching ${uneval(arg)}`), () => passed()),
	)
}
