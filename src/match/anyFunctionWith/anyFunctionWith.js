import { createMatcher, createExpectFromMatcher } from "../helper.js"
import { matchAnyFunction } from "../anyFunction/anyFunction.js"
import { matchWithProperties } from "../withProperties/withProperties.js"

export const matchAnyFunctionWith = expectedProperties =>
	createMatcher(actual =>
		matchAnyFunction()(actual).then(() => matchWithProperties(expectedProperties)(actual)),
	)
export const expectAnyFunctionWith = createExpectFromMatcher(matchAnyFunctionWith)
