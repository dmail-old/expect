import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { matchAnyObject } from "../anyObject/anyObject.js"
import { matchWithProperties } from "../withProperties/withProperties.js"

export const matchAnyObjectWith = expectedProperties =>
	createMatcher(actual =>
		matchAnyObject()(actual).then(() => matchWithProperties(expectedProperties)(actual)),
	)
export const expectAnyObjectWith = createExpectFromMatcher(matchAnyObjectWith)
