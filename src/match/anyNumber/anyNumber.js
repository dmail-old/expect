import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"
import { createExpectationFromMatcher } from "../helper.js"

export const matchAnyNumber = curry(matchConstructedBy, Number)
export const expectAnyNumber = createExpectationFromMatcher(matchAnyNumber)
