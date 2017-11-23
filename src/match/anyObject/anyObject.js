import { createExpectFromMatcher } from "../helper.js"
import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"

export const matchAnyObject = curry(matchConstructedBy, Object)
export const expectAnyObject = createExpectFromMatcher(matchAnyObject)
