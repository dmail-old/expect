import { sequence } from "@dmail/action"
import { same } from "./same/same.js"

const labelSymbol = Symbol()
export const label = (value, labelName) => {
	return {
		[labelSymbol]: labelName,
		value,
	}
}
const getLabelNameAndValue = (value, previousLabelNames = []) => {
	if (value && value.hasOwnProperty(labelSymbol)) {
		return getLabelNameAndValue(value.value, [...previousLabelNames, value[labelSymbol]])
	}
	return {
		label: [...previousLabelNames, "value"].join(" "),
		value,
	}
}

const matchSymbol = Symbol()
export const isMatcher = value =>
	value !== null && value !== undefined && value.hasOwnProperty(matchSymbol)

const createMatcherFrom = value => {
	if (isMatcher(value)) {
		return value
	}
	return same(value)
}

export const createMatcher = (fn, ...args) => {
	const matcher = (...passedArgs) => fn(...args, ...passedArgs)
	matcher[matchSymbol] = true
	Object.defineProperty(matcher, "constructor", {
		enumerable: false,
		/* istanbul ignore next */
		value: function Matcher() {},
	})
	return matcher
}

export const matchAll = (...args) =>
	createMatcher(actual => {
		const { name, value } = getLabelNameAndValue(actual)
		return sequence(args, arg => {
			return createMatcherFrom(arg)(value).then(null, message => `${name} mismatch: ${message}`)
		})
	})

export const composeMatcher = mapping =>
	createMatcher(actual => {
		return sequence(Object.keys(mapping), key => {
			return createMatcherFrom(mapping[key])(actual[key])
		})
	})

export const emptyParamSignature = ({
	fn,
	createMessage = `${fn} must be called without argument`,
}) => (...args) => {
	if (args.length > 0) {
		throw new Error(createMessage())
	}
	return fn()
}

export const oneOrMoreParamSignature = ({
	fn,
	createMessage = `${fn} must be called with one argument or more`,
}) => (...args) => {
	if (args.length === 0) {
		throw new Error(createMessage())
	}
	return fn()
}
