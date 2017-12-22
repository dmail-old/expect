/*
it should bebcome a module @dmail/signature
*/

export const allPredicate = (...predicates) => (...args) => {
	for (const predicate of predicates) {
		const returnValue = predicate(...args)
		if (returnValue) {
			return returnValue
		}
	}
}

export const spreadPredicate = (predicate) => (...args) => {
	let index = 0
	while (index < args.length) {
		const returnValue = predicate(args[index])
		if (returnValue) {
			return `unexpected arg n°${index}: ${returnValue}`
		}
		index++
	}
	return false
}

const createArgumentLengthPredicate = (expectedLength) => (...args) => {
	if (args.length !== expectedLength) {
		if (expectedLength === 0) {
			return `must be called without argument`
		}
		return `must be called with ${expectedLength} argument, got ${args.length}`
	}
}

export const zeroArgument = createArgumentLengthPredicate(0)

export const oneArgument = createArgumentLengthPredicate(1)

export const twoArgument = createArgumentLengthPredicate(2)

export const oneOrMoreArgument = (...args) => {
	if (args.length === 0) {
		return `must be called with one or more argument, got 0`
	}
}

export const sign = (predicate, fn) => {
	const signedFunction = (...args) => {
		const message = predicate(...args)
		if (message) {
			throw new Error(message)
		}
		return fn(...args)
	}
	return signedFunction
}
