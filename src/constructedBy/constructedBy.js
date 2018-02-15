import { createMatcherFromFunction } from "../matcher.js"

const getConstructorName = (constructor) => {
	const { name } = constructor
	return name
}

const getConstructorNameFromValue = (value) => {
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
	const name = getConstructorName(value.constructor)
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

export const prefix = (type) => {
	if (type === "null" || type === "undefined") {
		return type
	}
	const firstLetter = type[0].toLowerCase()
	if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
		return `an ${firstLetter + type.slice(1)}`
	}
	return `a ${firstLetter + type.slice(1)}`
}

export const prefixValue = (value) => prefix(getConstructorName(value))

const createFailedConstructorMessage = (expected, actual) =>
	`expect ${prefix(expected)} but got ${prefix(actual)}`

export const constructedBy = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	const expectedConstructorName = getConstructorName(expected)
	const actualConstructorName = getConstructorNameFromValue(actual)
	if (actualConstructorName === expectedConstructorName) {
		return pass()
	}
	return fail(
		createFailedConstructorMessage(expectedConstructorName, actualConstructorName, actual),
	)
})

export const sameConstructor = createMatcherFromFunction(({ expected, actual, fail, pass }) => {
	const expectedConstructorName = getConstructorNameFromValue(expected)
	const actualConstructorName = getConstructorNameFromValue(actual)
	if (actualConstructorName === expectedConstructorName) {
		return pass()
	}
	return fail(
		createFailedConstructorMessage(expectedConstructorName, actualConstructorName, actual),
	)
})
