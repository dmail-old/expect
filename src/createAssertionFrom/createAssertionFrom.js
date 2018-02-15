import { isAssertion } from "../matcher.js"
import { same } from "../same/same.js"

export const createAssertionFrom = value => {
	if (isAssertion(value)) {
		return value
	}
	return same(value)
}
