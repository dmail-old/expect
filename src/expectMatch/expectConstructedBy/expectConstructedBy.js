import { failed, passed } from "@dmail/action"
import { expectMatch, createMatcher, createExpectFromMatcherFactory } from "../expectMatch.js"

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

const getConstructorName = value => value.constructor.name
const createFailedConstructorMessage = (actual, expected) =>
	`expect value constructed by ${expected} but got ${actual}`

export const matchConstructor = (...args) =>
	createMatcher(value => {
		const [constructor] = args
		const constructorName = constructor.name
		const actualConstructorName = getConstructorName(value)
		if (actualConstructorName !== constructorName) {
			return failed(createFailedConstructorMessage(actualConstructorName, constructorName, value))
		}
		if (args.length > 1) {
			return expectMatch(value, args[1])
		}
		return passed()
	})
export const expectConstructedBy = createExpectFromMatcherFactory(matchConstructor)

const curry = (fn, ...curriedArgs) => (...args) => fn(...[...curriedArgs, ...args])

export const matchError = curry(matchConstructor, Error)
export const matchTypeError = curry(matchConstructor, TypeError)

export const expectError = createExpectFromMatcherFactory(matchError)
export const expectTypeError = createExpectFromMatcherFactory(matchTypeError)
