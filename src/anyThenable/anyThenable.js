import { createMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { propertiesMatchAllowingExtra } from "../propertiesMatch/propertiesMatch.js"

const mustHaveAThenMethod = propertiesMatchAllowingExtra({
	then: any(Function),
})

export const anyThenable = () =>
	createMatcher(actual =>
		mustHaveAThenMethod(actual).then(null, mismatch => `thenable mismatch: ${mismatch}`),
	)
