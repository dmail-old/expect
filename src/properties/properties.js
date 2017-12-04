import {
	isMatcher,
	createMatcherFromFunction,
	createPassedMatcher,
	createMatcherDiscovering,
} from "../matcher.js"
import { exactly } from "../exactly/exactly.js"
import { canHaveOwnProperty, getOwnPropertyNames, hasProperty } from "../helper.js"
import { matchAll } from "../matchAll/matchAll.js"
import { getTracePath } from "../trace/trace.js"

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

const getTraceReference = (
	trace,
	getter = ({ getValue }) => getValue(),
	compare = (a, b) => a === b,
) => {
	const history = trace.getHistory()
	const value = getter(trace)
	const found = history.find(previousTrace => compare(getter(previousTrace), value))
	return found ? found.lastValueOf() : null
}

const getExpectedReference = trace =>
	getTraceReference(trace, ({ getValue }) => getValue().expected)

const createPropertyMatcher = (name, matcher) => {
	return createMatcherDiscovering(
		actual => ({
			name,
			value: actual[name],
		}),
		matcher,
	)
}

const propertyMatch = (name, matcher) => {
	return createPropertyMatcher(
		name,
		createMatcherFromFunction(({ trace, fail }) => {
			if (isActualAbstract(trace)) {
				return fail({ type: "missing-property" })
			}
			return matcher
		}),
	)
}

const ancestorMatch = (path, createAncestorMatcher) => {
	const findAncestor = (trace, index) => {
		const expectedParentName = path[index]
		const traceParent = trace.getParentTrace()
		if (traceParent.getName() !== expectedParentName) {
			return null
		}
		if (index === path.length - 1) {
			return traceParent
		}
		return findAncestor(traceParent, index + 1)
	}

	return createMatcherFromFunction(({ trace, fail }) => {
		const ancestor = findAncestor(trace, 0)

		if (ancestor === null) {
			return fail({ type: "missing-recursion" })
		}
		return createAncestorMatcher(ancestor)
	})
}

const compareProperties = options => {
	const { allowExtra, extraMustBeEnumerable } = options

	return () => {
		const createExpectedPropertyMatcher = name => {
			return propertyMatch(
				name,
				createMatcherFromFunction(({ trace, expected }) => {
					if (isMatcher(expected)) {
						return propertyMatch(name, expected)
					}
					if (canHaveOwnProperty(expected)) {
						const expectedReference = getExpectedReference(trace)
						if (expectedReference) {
							return propertyMatch(
								name,
								ancestorMatch(getTracePath(expectedReference), ancestor => exactly(ancestor)),
							)
						}

						return createMatcherFromFunction(compareProperties(options))
					}
					return exactly
				}),
			)
		}

		const createAllExpectedPropertyMatcher = expected => {
			const expectedPropertyNames = getOwnPropertyNames(expected)
			const propertyMatchers = expectedPropertyNames.map(name =>
				createExpectedPropertyMatcher(name),
			)
			return matchAll(...propertyMatchers)
		}

		const createActualPropertyMatcher = name => {
			return createPropertyMatcher(
				name,
				createMatcherFromFunction(({ trace, fail, pass }) => {
					if (extraMustBeEnumerable && isActualHidden(trace)) {
						return pass()
					}
					return fail({ type: "extra" })
				}),
			)
		}

		const createAllActualPropertyMatcher = (actual, expected) => {
			if (allowExtra) {
				return createPassedMatcher()
			}
			const actualPropertyNames = getOwnPropertyNames(actual)
			const expectedPropertyNames = getOwnPropertyNames(expected)
			const actualExtraPropertyNames = actualPropertyNames.filter(
				name => expectedPropertyNames.includes(name) === false,
			)
			const actualPropertyMatchers = actualExtraPropertyNames.map(name =>
				createActualPropertyMatcher(name),
			)
			return matchAll(...actualPropertyMatchers)
		}

		return matchAll(
			createMatcherFromFunction(({ expected }) => {
				return createAllExpectedPropertyMatcher(expected)
			}),
			createMatcherFromFunction(({ expected, actual }) => {
				return createAllActualPropertyMatcher(actual, expected)
			}),
		)
	}
}

export const propertiesMatch = createMatcherFromFunction(
	compareProperties({
		allowExtra: true,
		extraMustBeEnumerable: true,
	}),
)

export const strictPropertiesMatch = createMatcherFromFunction(
	compareProperties({
		allowExtra: false,
		extraMustBeEnumerable: true,
	}),
)

// add propertiesMatchingIncludingHidden
// add strictPropertiesMatchingIncludingHidden
