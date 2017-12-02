import { isMatcher } from "../matcher.js"
import { same } from "../same/same.js"

export const createMatcherFrom = value => {
	if (isMatcher(value)) {
		return value
	}
	return same(value)
}
