/*
it should bebcome a module @dmail/signature

http://elm-lang.org/blog/compiler-errors-for-humans
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
			return `unexpected arg n°${index}:
${returnValue}`
		}
		index++
	}
	return false
}

const createArgumentLengthPredicate = (expectedLength) => (...args) => {
	const actualLength = args.length
	const extraArgumentCount = actualLength - expectedLength
	const missingArgumentCount = expectedLength - actualLength

	if (extraArgumentCount > 0) {
		if (expectedLength === 0) {
			return `${extraArgumentCount} unexpected argument, must be called without argument`
		}
		return `${extraArgumentCount} unexpected argument, must be called with ${expectedLength} argument`
	}
	if (missingArgumentCount > 0) {
		return `${missingArgumentCount} argument missing, must be called with ${expectedLength} argument`
	}
}

export const oneOrMoreArgument = (...args) => {
	if (args.length === 0) {
		return `one ore more argument missing, must be called with one or more argument`
	}
}

export const zeroArgument = createArgumentLengthPredicate(0)

export const oneArgument = createArgumentLengthPredicate(1)

export const twoArgument = createArgumentLengthPredicate(2)

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
