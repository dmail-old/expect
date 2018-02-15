import { createMatcherFromFunction } from "../matcher.js"
import { sameConstructor } from "../constructedBy/constructedBy.js"
import { exactProperties } from "../properties/properties.js"
import { canHaveProperty } from "../helper.js"
import { is } from "../is/is.js"

export const same = createMatcherFromFunction(({ expected, actual }) => {
	if (canHaveProperty(expected)) {
		return is(expected)(actual).then(null, () => {
			return sameConstructor(expected)(actual).then(() => exactProperties(expected)(actual))
		})
	}
	return is(expected)(actual)
})
