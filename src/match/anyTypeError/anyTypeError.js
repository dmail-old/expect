import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"
import { createExpectFromMatcher } from "../helper.js"

export const matchAnyTypeError = curry(matchConstructedBy, TypeError)
export const expectAnyTypeError = createExpectFromMatcher(matchAnyTypeError)
