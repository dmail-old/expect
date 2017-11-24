import { passed, failed, sequence } from "@dmail/action"
import { same } from "./same/same.js"

const matchSymbol = Symbol()
export const isMatcher = value =>
	value !== null && value !== undefined && value.hasOwnProperty(matchSymbol)

export const createMatcher = fn => {
	const matcher = (...args) => fn(...args)
	matcher[matchSymbol] = true
	Object.defineProperty(matcher, "constructor", {
		enumerable: false,
		/* istanbul ignore next */
		value: function Matcher() {},
	})
	return matcher
}

const expectationSymbol = Symbol()
const isExpectation = value =>
	value !== null && value !== undefined && value.hasOwnProperty(expectationSymbol)
export const createExpectation = ({ getName = () => "value", getValue }) => {
	const expect = () =>
		passed(getValue()).then(value => ({
			name: getName(),
			value,
		}))
	expect[expectationSymbol] = true
	return expect
}

const expectValue = value =>
	createExpectation({
		getValue: () => value,
	})

export const match = (actual, ...args) => {
	if (args.length === 0) {
		return failed(`match expect at least two arguments`)
	}

	const expectation = isExpectation(actual) ? actual : expectValue(actual)

	return expectation().then(({ name, value }) =>
		sequence(args, arg => {
			let matcher
			if (isMatcher(arg)) {
				matcher = arg
			} else {
				matcher = same(arg)
			}
			return matcher(value).then(null, message => `${name} mismatch: ${message}`)
		}),
	)
}
