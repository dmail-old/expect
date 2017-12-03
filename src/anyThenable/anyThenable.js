import { createMatcher } from "../matcher.js"
import { any } from "../any/any.js"
import { propertiesMatch } from "../properties/properties.js"

const mustHaveAThenMethod = propertiesMatch({
	then: any(Function),
})

export const anyThenable = createMatcher(({ match }) => {
	match(mustHaveAThenMethod)
})
