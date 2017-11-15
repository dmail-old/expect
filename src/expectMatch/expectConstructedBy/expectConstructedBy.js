import { failed, passed } from "@dmail/action"
import {
	expectMatch,
	createMatcher,
	createExpectFromMatcherFactory,
	isMatcher
} from "../expectMatch.js"
import { matchProperties } from "../index"

// const firstLetterLowerCase = name => name[0].toLowerCase() + name.slice(1)
// const objectTagPrefixLength = "[object ".length
// const getTag = value => Object.prototype.toString.call(value).slice(objectTagPrefixLength, -1)
// const hasTag = (value, expectedTag) => {
// 	// eslint-disable-next-line no-constant-condition
// 	while (true) {
// 		const tag = getTag(value)
// 		if (tag === expectedTag) {
// 			return true
// 		}
// 		if (value === null) {
// 			break
// 		}
// 		const type = typeof value
// 		if (type !== "object" && type !== "function") {
// 			break
// 		}
// 		const prototype = Object.getPrototypeOf(value)
// 		if (prototype === null) {
// 			break
// 		}
// 		value = prototype
// 	}
// 	return false
// }

const curry = (fn, ...curriedArgs) => (...args) => fn(...[...curriedArgs, ...args])

const getConstructorName = value => value.constructor.name
const createFailedConstructorMessage = (actual, expected) => {
	return `expect value constructed by ${expected} but got ${actual}`
}

export const matchConstructor = constructor =>
	createMatcher(value => {
		const constructorName = constructor.name
		const actualConstructorName = getConstructorName(value)
		if (actualConstructorName !== constructorName) {
			return failed(createFailedConstructorMessage(actualConstructorName, constructorName, value))
		}
		return passed()
	})
export const expectConstructedBy = createExpectFromMatcherFactory(matchConstructor)

export const matchError = curry(matchConstructor, Error)
export const expectError = createExpectFromMatcherFactory(matchError)

export const matchTypeError = curry(matchConstructor, TypeError)
export const expectTypeError = createExpectFromMatcherFactory(matchTypeError)

const firstLetterToLowerCase = string => string[0].toLowerCase() + string.slice(1)
const augmentMismatchMessageForConstructedValue = (value, constructor, mismatch) => {
	return `${firstLetterToLowerCase(constructor.name)} mismatch: ${mismatch}`
}
export const matchConstructorWith = (constructor, expected) => {
	if (expected && typeof expected === "object" && isMatcher(expected) === false) {
		expected = matchProperties(expected)
	}
	return createMatcher(actual =>
		expectConstructedBy(actual, constructor).then(() =>
			expectMatch(actual, expected).then(null, failure =>
				augmentMismatchMessageForConstructedValue(actual, constructor, failure)
			)
		)
	)
}

export const matchErrorWith = curry(matchConstructorWith, Error)
export const expectErrorWith = createExpectFromMatcherFactory(matchErrorWith)

export const matchTypeErrorWith = curry(matchConstructorWith, TypeError)
export const expectTypeErrorWith = createExpectFromMatcherFactory(matchTypeErrorWith)
