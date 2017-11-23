import { createExpectFromMatcher } from "../helper.js"
import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"

export const matchAnyString = curry(matchConstructedBy, String)
export const expectAnyString = createExpectFromMatcher(matchAnyString)
