/*
ça serais bien de s'assurer d'un truc du coup: gence ça:

expect(
	() => {
		throw { foo: true }
	},
	throwMatch(
		propertiesMatch({
			foo: false
		})
	)
)

// que ça fail bien avec

"throwed value foo mismatch: expect true but got false"

actuellement propertiesMatch perds la trace de la valeur
le concept de trace qu'on a mis en place ici il faudrait qu'il soit partagé par tout les matchers
lorsqu'un matcher est appelé sans trace il est le matcher racine et peut le savoir

*/

import { isMatcher, createMatcher } from "../matcher.js"
import { passed, sequence, chainFunctions } from "@dmail/action"
// import { prefixValue } from "../any/any.js"
import { exactly } from "../exactly/exactly.js"
// import { uneval } from "@dmail/uneval"
import {
	canHaveOwnProperty,
	getOwnPropertyNames,
	hasProperty,
	oneArgumentSignature,
} from "../helper.js"

// if you want to prevent the recursion behaviour on an object/function
// you can specify a matcher for the value and it will use the matcher
/*
{
	array: strictEqual(array)
}
*/

const propertyIsEnumerable = (object, name) => {
	return Object.prototype.propertyIsEnumerable.call(object, name)
}

const defaultCreateMatcherFromPropertyValue = (expected, recurse) => {
	if (canHaveOwnProperty(expected)) {
		return recurse(expected)
	}
	return exactly(expected)
}

const getReference = trace => {
	const value = trace.getValue()
	if (typeof value === "object" || typeof value === "function") {
		return trace.getFirstTraceFor(value)
	}
	return null
}

const compareProperties = ({ allowExtra, extraMustBeEnumerable, createPropertyValueMatcher }) => {
	return createMatcher(({ fail, pass, actual, expected, nest }) => {
		const actualReference = getReference(actual)
		const expectedReference = getReference(expected)
		if (actualReference) {
			if (expectedReference) {
				return pass()
			}
			if (allowExtra) {
				return pass()
			}
			if (
				extraMustBeEnumerable &&
				propertyIsEnumerable(actual.getParentTrace().getValue(), actual.getName()) === false
			) {
				return pass()
			}
			return fail({ type: "extra-recursion", data: actualReference })
		}
		if (expectedReference) {
			if (actualReference) {
				return pass()
			}
			return fail({ type: "missing-recursion", data: expectedReference })
		}

		const actualValue = actual.getValue()
		const expectedValue = expected.getValue()

		const compareExpectedProperties = () => {
			const expectedPropertyNames = getOwnPropertyNames(expectedValue)
			const recurse = expected => {
				return compareProperties(expected, {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
				})
			}

			return sequence(expectedPropertyNames, name => {
				const propertyActual = actualValue[name]
				const propertyExpected = expectedValue[name]
				const { fail, match } = nest({
					name,
					actual: propertyActual,
					expected: propertyExpected,
				})
				if (hasProperty(actual, name) === false) {
					return fail({ type: "missing" })
				}
				if (isMatcher(propertyExpected)) {
					return match(propertyExpected)
				}
				return match(createPropertyValueMatcher(recurse))
			})
		}

		const compareActualProperties = () => {
			if (allowExtra) {
				return passed()
			}

			const actualPropertyNames = getOwnPropertyNames(actualValue)
			return sequence(actualPropertyNames, name => {
				const { pass, fail } = nest({
					name,
					actual: actualValue[name],
					expected: expected.getValue()[name],
				})

				if (hasProperty(expected, name)) {
					return pass()
				}
				if (extraMustBeEnumerable && propertyIsEnumerable(actualValue, name) === false) {
					return pass()
				}
				return fail({ type: "extra" })
			})
		}

		return chainFunctions(compareExpectedProperties, compareActualProperties)
	})
}

export const propertiesMatch = oneArgumentSignature({
	fn: expected =>
		compareProperties({
			allowExtra: true,
			extraMustBeEnumerable: true,
			createPropertyValueMatcher: defaultCreateMatcherFromPropertyValue,
		})(expected),
})

export const strictPropertiesMatch = oneArgumentSignature({
	fn: expected =>
		compareProperties({
			allowExtra: false,
			extraMustBeEnumerable: true,
			createPropertyValueMatcher: defaultCreateMatcherFromPropertyValue,
		})(expected),
})

// add propertiesMatchingIncludingHidden
// add strictPropertiesMatchingIncludingHidden
