import { sequence } from "@dmail/action"
import { same } from "./same/same.js"
import { hasSymbol } from "./helper.js"

const labelSymbol = Symbol()
export const label = (value, labelName) => {
	return {
		[labelSymbol]: labelName,
		value,
	}
}
const getLabelNameAndValue = (value, previousLabelNames = []) => {
	if (hasSymbol(value, labelSymbol)) {
		return getLabelNameAndValue(value.value, [...previousLabelNames, value[labelSymbol]])
	}
	return {
		label: [...previousLabelNames, "value"].join(" "),
		value,
	}
}

const matchSymbol = Symbol()
export const isMatcher = value => hasSymbol(value, matchSymbol)

export const createMatcherFrom = value => {
	if (isMatcher(value)) {
		return value
	}
	return same(value)
}

export const createMatcher = fn => {
	const matcher = actual => fn(actual)
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
