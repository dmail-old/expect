import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { matchAnyError } from "../anyError/anyError.js"
import { matchHavingProperties } from "../withProperties/withProperties.js"

export const matchAnyErrorHaving = expectedProperties =>
	createMatcher(actual =>
		matchAnyError()(actual).then(() => matchHavingProperties(expectedProperties)(actual)),
	)
export const expectAnyErrorHaving = createExpectFromMatcher(matchAnyErrorHaving)
