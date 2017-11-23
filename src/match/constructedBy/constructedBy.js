import { createMatcher } from "../helper.js"
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
	return value.constructor.name
}

export const prefix = type => {
	if (type === "null" || type === "undefined") {
		return type
	}
	const firstLetter = type[0].toLowerCase()
	if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
		return `an ${type}`
	}
	return `a ${type}`
}

export const prefixValue = value => prefix(getConstructorName(value))

const createFailedConstructorMessage = (actual, expected) =>
	`expect ${prefix(expected)} but got ${prefix(actual)}`

const matchConstructor = expectedConstructorName =>
	createMatcher(value => {
		const actualConstructorName = getConstructorName(value)
		if (actualConstructorName !== expectedConstructorName) {
			return failed(
				createFailedConstructorMessage(actualConstructorName, expectedConstructorName, value),
			)
		}
		return passed()
	})

export const matchConstructedBy = expectedConstructor => matchConstructor(expectedConstructor.name)

export const matchConstructedByFromValue = expectedValue =>
	matchConstructedBy(getConstructorName(expectedValue))
