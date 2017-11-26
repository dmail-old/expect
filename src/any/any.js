import { createMatcher } from "../matcher.js"
import { failed, passed } from "@dmail/action"

const getConstructorName = value => {
	if (value === null) {
		return "null"
	}
	if (value === undefined) {
		return "undefined"
	}
	// handle Object.create(null)
	if (typeof value === "object" && "constructor" in value === false) {
		return "Object"
	}
	const { name } = value.constructor
	if (name === "") {
		if (typeof value === "object") {
			return "Object"
		}
		if (typeof value === "function") {
			return "Function"
		}
		return "Anonymous"
	}
	return name
}

export const prefix = type => {
	if (type === "null" || type === "undefined") {
		return type
	}
	const firstLetter = type[0].toLowerCase()
	if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
		return `an ${firstLetter + type.slice(1)}`
	}
	return `a ${firstLetter + type.slice(1)}`
}

export const prefixValue = value => prefix(getConstructorName(value))

const createFailedConstructorMessage = (actual, expected) =>
	`expect ${prefix(expected)} but got ${prefix(actual)}`

export const matchConstructorName = expectedConstructorName =>
	createMatcher(value => {
		const actualConstructorName = getConstructorName(value)
		if (actualConstructorName !== expectedConstructorName) {
			return failed(
				createFailedConstructorMessage(actualConstructorName, expectedConstructorName, value),
			)
		}
		return passed(value)
	})

export const matchConstructedBy = expectedConstructor =>
	matchConstructorName(expectedConstructor.name)

export const matchConstructedByFromValue = expectedValue =>
	matchConstructedBy(getConstructorName(expectedValue))

export const any = expectedConstructor => {
	if (expectedConstructor === undefined) {
		return createMatcher(() => passed())
	}
	return matchConstructedBy(expectedConstructor)
}
