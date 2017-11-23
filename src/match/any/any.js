import { passed } from "@dmail/action"
import { createMatcher, createExpectFromMatcher } from "../helper.js"

export const matchAny = () => createMatcher(() => passed())
// expectAny seems completely useless because it cannot fail
export const expectAny = () => createExpectFromMatcher(matchAny)
