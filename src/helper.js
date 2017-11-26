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

const canHaveSymbol = value => {
	if (value === null) {
		return false
	}
	if (value === undefined) {
		return false
	}
	return true
}

const canHaveNonNativeSymbol = value => {
	if (canHaveSymbol(value)) {
		return typeof value === "object" || typeof value === "function"
	}
	return false
}

export const hasSymbol = (value, symbol) => {
	if (canHaveNonNativeSymbol(value)) {
		// we use Object.prototype.hasOwnProperty to support Object.create(null)
		return Object.prototype.hasOwnProperty.call(value, symbol)
	}
	return false
}

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
	return fn(...args)
}
