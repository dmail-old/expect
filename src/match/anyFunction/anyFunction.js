import { matchConstructedBy } from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"
import { createExpectationFromMatcher } from "../helper.js"

export const matchAnyFunction = curry(matchConstructedBy, Function)
export const expectAnyFunction = createExpectationFromMatcher(matchAnyFunction)
