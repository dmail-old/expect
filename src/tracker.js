/*
this logic may pass right into action.js
which would by default return the raw value when calling .getResult
an other function (getInternalResult) woudl return the wrapper result
to differentiate it from other results
*/

let previousId = -1
const trackerSymbol = Symbol()

export const createTracker = () => {
	const id = previousId + 1
	previousId = id

	const track = (...args) => {
		return {
			[trackerSymbol]: true,
			id,
			args,
			valueOf: () => args[0],
			toString: () => args[0]
		}
	}
	const detect = value => {
		if (value && trackerSymbol in value) {
			return value.id === id
		}
		return false
	}
	return {
		id,
		track,
		detect
	}
}

const createMatcher = (matchers, defaultMatcher) => value => {
	if (value && trackerSymbol in value) {
		const id = value.id
		if (id in matchers) {
			return matchers[id](...value.args)
		}
		return defaultMatcher ? defaultMatcher(...value.args) : value
	}
	return value
}

export const remapFailure = (action, failureMatchers) =>
	action.then(null, value => createMatcher(failureMatchers)(value))
