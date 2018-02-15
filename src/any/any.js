import { createMatcherFromFunction } from "../matcher.js"
import { withoutArgumentSignature } from "../signature.js"

// any must be called without argument
// but matcher must always be called with one argument
// so call it with null to satisfy matcher signature
export const any = withoutArgumentSignature(() => {
	return createMatcherFromFunction(({ pass }) => pass())(null)
})
