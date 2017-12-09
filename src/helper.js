export const createIndexes = (to, from = 0) => {
	const array = []
	let index = from
	while (index !== to) {
		array.push(index)
		index++
	}
	return array
}

export const curry = (fn, ...curriedArgs) => (...args) => fn(...[...curriedArgs, ...args])

export const canHaveProperty = value => {
	if (value === null) {
		return false
	}
	if (value === undefined) {
		return false
	}
	return true
}

export const canHaveOwnProperty = value => {
	if (canHaveProperty(value)) {
		return typeof value === "object" || typeof value === "function"
	}
	return false
}

export const hasOwnProperty = (value, propertyName) => {
	if (canHaveOwnProperty(value) === false) {
		return false
	}
	// using Object.prototype.hasOwnProperty.call to support Object.create(null)
	return Object.prototype.hasOwnProperty.call(value, propertyName)
}

export const hasProperty = (value, propertyName) => {
	if (canHaveProperty(value) === false) {
		return false
	}
	if (hasOwnProperty(value, propertyName)) {
		return true
	}
	const valuePrototype = Object.getPrototypeOf(value)
	return hasProperty(valuePrototype, propertyName)
}

export const getOwnPropertyNamesAndSymbols = value => {
	if (canHaveOwnProperty(value)) {
		return Object.getOwnPropertyNames(value).concat(Object.getOwnPropertySymbols(value))
	}
	return []
}

const argumentLengthSignature = ({
	fn,
	expectedLength,
	createMessage = (fn, args) => {
		if (expectedLength === 0) {
			return `${fn} must be called without argument`
		}
		return `${fn} must be called with ${expectedLength} argument, (got ${args.length})`
	},
}) => (...args) => {
	if (args.length === expectedLength) {
		return fn(...args)
	}
	throw new Error(createMessage(fn, args))
}

export const withoutArgumentSignature = ({ fn, createMessage }) =>
	argumentLengthSignature({
		expectedLength: 0,
		fn,
		createMessage,
	})

export const oneArgumentSignature = ({ fn, createMessage }) =>
	argumentLengthSignature({
		expectedLength: 1,
		fn,
		createMessage,
	})

export const twoArgumentSignature = ({ fn, createMessage }) =>
	argumentLengthSignature({
		expectedLength: 2,
		fn,
		createMessage,
	})

export const oneArgumentOrMoreSignature = ({
	fn,
	createMessage = fn => `${fn} must be called with one argument or more`,
}) => (...args) => {
	if (args.length === 0) {
		throw new Error(createMessage(fn, args))
	}
	return fn(...args)
}

export const firstArgumentNotNullNorUndefined = ({
	fn,
	createMessage = firstArg => `${fn} first argument must not be ${firstArg}`,
}) => (...args) => {
	const [firstArg] = args
	if (firstArg === null || firstArg === undefined) {
		throw new TypeError(createMessage(firstArg))
	}
	return fn(firstArg)
}
