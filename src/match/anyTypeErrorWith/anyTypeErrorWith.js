import { createMatcher, createExpectFromMatcher } from "../helpers.js"
import { matchAnyTypeError } from "../anyTypeError/anyTypeError.js"
import { matchWithProperties } from "../withProperties/withProperties.js"

export const matchAnyTypeErrorWith = expectedProperties =>
	createMatcher(actual =>
		matchAnyTypeError()(actual).then(() => matchWithProperties(expectedProperties)(actual)),
	)
export const expectAnyTypeErrorWith = createExpectFromMatcher(matchAnyTypeErrorWith)
