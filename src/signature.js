export const createSignature = (predicate) => (fn) => {
	const signedFunction = (...args) => {
		const message = predicate(...args)
		if (message) {
			throw new Error(message)
		}
		return fn(...args)
	}
	return signedFunction
}

export const allPredicate = (...predicates) => (...args) => {
	for (const predicate of predicates) {
		const returnValue = predicate(...args)
		if (returnValue) {
			return returnValue
		}
	}
}

export const spreadPredicate = (predicate) => (...args) => {
	for (const arg of args) {
		const returnValue = predicate(arg)
		if (returnValue) {
			return returnValue
		}
	}
}

const createArgumentLengthPredicate = (expectedLength) => (...args) => {
	if (args.length !== expectedLength) {
		if (expectedLength === 0) {
			return `must be called without argument`
		}
		return `must be called with ${expectedLength} argument, (got ${args.length})`
	}
}

export const zeroArgumentPredicate = createArgumentLengthPredicate(0)

export const oneArgumentPredicate = createArgumentLengthPredicate(1)

export const twoArgumentPredicate = createArgumentLengthPredicate(2)

export const oneOrMoreArgumentPredicate = (...args) => {
	if (args.length === 0) {
		return `must be called with one or more argument, got 0`
	}
}

export const withoutArgumentSignature = createSignature(zeroArgumentPredicate)

export const oneArgumentSignature = createSignature(oneArgumentPredicate)

export const twoArgumentSignature = createSignature(twoArgumentPredicate)

export const oneOrMoreArgumentSignature = createSignature(oneOrMoreArgumentPredicate)
