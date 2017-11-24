import {
	matchConstructedBy,
	matchConstructedByHaving,
	matchConstructedByHavingAtLeast,
} from "../constructedBy/constructedBy.js"
import { curry } from "../../helper.js"
import { createExpectFromMatcher } from "../helper.js"

export const matchAnyError = curry(matchConstructedBy, Error)
export const matchAnyErrorHaving = curry(matchConstructedByHaving, Error)
export const matchAnyErrorHavingAtLeast = curry(matchConstructedByHavingAtLeast, Error)

export const expectAnyError = createExpectFromMatcher(matchAnyError)
export const expectAnyErrorHaving = createExpectFromMatcher(matchAnyErrorHaving)
export const expectAnyErrorHavingAtLeast = createExpectFromMatcher(matchAnyErrorHavingAtLeast)
