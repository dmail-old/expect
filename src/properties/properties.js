import { isMatcher, createMatcher } from "../matcher.js"
import { exactly } from "../exactly/exactly.js"
import {
	canHaveOwnProperty,
	getOwnPropertyNames,
	oneArgumentSignature,
	hasProperty,
} from "../helper.js"
import { matchAll } from "../matchAll/matchAll.js"
import { createAnonymousTrace, getTracePath } from "../trace/trace.js"

const propertyIsEnumerable = (object, name) => {
	return Object.prototype.propertyIsEnumerable.call(object, name)
}

const isActualEnumerable = trace => {
	return propertyIsEnumerable(trace.getParentTrace().getValue().actual, trace.getName())
}

const isActualHidden = trace => isActualEnumerable(trace) === false

const isActualConcrete = trace => {
	return hasProperty(trace.getParentTrace().getValue().actual, trace.getName())
}

const isActualAbstract = trace => isActualConcrete(trace) === false

const getTraceReference = (trace, getter) => {
	const history = trace.getHistory()
	const value = getter(trace)
	const found = history.find(previousTrace => getter(previousTrace) === value)
	return found ? found.lastValueOf() : null
}

const getActualReference = trace => getTraceReference(trace, ({ getValue }) => getValue().actual)

const getExpectedReference = trace =>
	getTraceReference(trace, ({ getValue }) => getValue().expected)

const createPropertyMatcher = (name, matcher) => {
	return createMatcher(({ actual, composeDiscovering }) => {
		composeDiscovering(name, actual[name], matcher)
	})
}

const propertyMatch = (name, matcher) => {
	return createPropertyMatcher(
		name,
		createMatcher(({ trace, fail, compose }) => {
			if (isActualAbstract(trace)) {
				return fail({ type: "missing-property" })
			}
			return compose(matcher)
		}),
	)
}

const sameReference = createMatcher(({ trace, expected, fail, pass }) => {
	const expectedPath = getTracePath(expected)

	const actualReference = getActualReference(trace)
	if (actualReference === null) {
		return fail({ type: "missing-recursion" })
	}
	const actualPath = getTracePath(actualReference)
	if (expectedPath.join("") !== actualPath.join("")) {
		return fail({ type: "recursion-mismatch" })
	}
	return pass()
})

const compareProperties = (expected, { trace, allowExtra, extraMustBeEnumerable }) => {
	const expectedPropertyNames = getOwnPropertyNames(expected)
	const propertyMatchers = expectedPropertyNames.map(name => {
		const expectedPropertyTrace = trace.discoverProperty(name)
		const expectedPropertyValue = expectedPropertyTrace.getValue()

		if (isMatcher(expectedPropertyValue)) {
			return propertyMatch(name, expectedPropertyValue)
		}
		if (canHaveOwnProperty(expectedPropertyValue)) {
			const expectedReference = getExpectedReference(expectedPropertyTrace)
			if (expectedReference) {
				return propertyMatch(name, sameReference(expectedReference))
			}

			return compareProperties(expectedPropertyValue, {
				trace: expectedPropertyTrace,
				allowExtra,
				extraMustBeEnumerable,
			})
		}
		return exactly(expectedPropertyValue)
	})
	const matchExpectedProperties = matchAll(...propertyMatchers)

	return createMatcher(({ actual, compose }) => {
		compose(
			matchAll(
				matchExpectedProperties(actual),
				createMatcher(({ pass, compose }) => {
					if (allowExtra) {
						return pass()
					}

					const actualPropertyNames = getOwnPropertyNames(actual)
					const actualExtraPropertyNames = actualPropertyNames.filter(
						name => expectedPropertyNames.includes(name) === false,
					)
					const actualPropertyMatchers = actualExtraPropertyNames.map(name => {
						return createPropertyMatcher(name, ({ trace, fail, pass }) => {
							if (extraMustBeEnumerable && isActualHidden(trace)) {
								return pass()
							}
							return fail({ type: "extra" })
						})
					})
					return compose(matchAll(...actualPropertyMatchers))
				}),
			),
		)
	})
}

export const propertiesMatch = oneArgumentSignature({
	fn: expected =>
		compareProperties(expected, {
			trace: createAnonymousTrace(expected),
			allowExtra: true,
			extraMustBeEnumerable: true,
		}),
})

export const strictPropertiesMatch = oneArgumentSignature({
	fn: expected =>
		compareProperties(expected, {
			trace: createAnonymousTrace(expected),
			allowExtra: false,
			extraMustBeEnumerable: true,
		}),
})

// add propertiesMatchingIncludingHidden
// add strictPropertiesMatchingIncludingHidden
