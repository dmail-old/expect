import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"
import { createExpectFromMatcher } from "../helper.js"

export const matchAnyError = curry(matchConstructedBy, Error)
export const expectAnyError = createExpectFromMatcher(matchAnyError)
