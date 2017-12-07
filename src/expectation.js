import { createFactory, isFactoryOf } from "@dmail/mixin"
import { createAction } from "@dmail/action"
import { createAnonymousTrace, getTraceReference } from "./trace/trace"
import { canHaveOwnProperty } from "./helper"

export const createExpectation = createFactory(({ expected, compare = () => {} }) => {
	let nextExpectation

	const chain = arg => {
		nextExpectation = arg
	}

	const match = (actual, trace) => {
		const action = createAction()
		if (trace === undefined) {
			trace = createAnonymousTrace({
				actual,
				expected,
			})
		}

		compare({
			actual,
			expected,
			fail: action.fail,
			pass: action.pass,
		})

		return action.then(
			value => {
				if (nextExpectation) {
					const nextTrace = trace.discover({
						actual: value,
						expected: nextExpectation.getExpected(),
					})
					return nextExpectation.match(value, nextTrace)
				}
				return {
					trace,
					value,
				}
			},
			value => ({
				trace,
				value,
			}),
		)
	}

	const getExpected = () => expected

	return {
		chain,
		match,
		getExpected,
	}
})

// const createExpectationFunction = properties => expected => {
// 	return createExpectation({
// 		expected,
// 		...properties,
// 	})
// }

const createExpectationFunctionFromCompare = compare => expected => {
	return createExpectation({
		expected,
		compare,
	})
}

export const exactly = createExpectationFunctionFromCompare(({ actual, expected, fail, pass }) => {
	if (actual === expected) {
		return pass()
	}
	return fail()
})

const hasProperty = null // will be imported from an helper
export const propertyPresence = createExpectationFunctionFromCompare(
	({ actual, expected, fail, pass }) => {
		if (hasProperty(actual, expected)) {
			return pass(actual[expected])
		}
		return fail()
	},
)

export const ancestorPresence = path => {
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

	return createExpectation({
		compare: ({ trace, fail, pass }) => {
			const ancestor = findAncestor(trace, 0)
			if (ancestor === null) {
				return fail()
			}
			return pass(ancestor)
		},
	})
}

const getOwnNames = value =>
	Object.getOwnPropertyNames(value).concat(Object.getOwnPropertySymbols(value))

export const propertiesMatch = expected => {
	const createExpectedPropertiesExpectation = (expected, trace) => {
		const expectedNames = getOwnNames(expected)
		const first = createExpectation({})
		return expectedNames.reduce((memo, name) => {
			const expectedPropertyValue = expected[name]
			let propertyValueExpectation
			if (isFactoryOf(createExpectation, expectedPropertyValue)) {
				propertyValueExpectation = expectedPropertyValue
			} else {
				const expectedReference = getTraceReference(trace, expected)
				if (expectedReference) {
					const ancestorValueExpectation = createExpectation({
						compare: ({ trace, actual, fail, pass }) => {
							if (trace.getParentTrace().actual !== actual) {
								return fail()
							}
							return pass()
						},
					})
					propertyValueExpectation = ancestorPresence(expected).chain(ancestorValueExpectation)
				} else if (canHaveOwnProperty(expected)) {
					propertyValueExpectation = createExpectedPropertiesExpectation(expected)
				} else {
					propertyValueExpectation = exactly(expected)
				}
			}

			return memo.chain(propertyPresence(name)).chain(propertyValueExpectation)
		}, first)
	}

	const createActualPropertiesExpectation = () => {
		return createExpectation({
			compare: ({ actual, expected, fail, pass }) => {
				const actualPropertyNames = getOwnNames(actual)
				const extraPropertyName = actualPropertyNames.find(
					name =>
						name in expected === false &&
						Object.getOwnPropertyDescriptor(actual, name).enumerable === true,
				)
				// hum ça aussi faut qu'on le chain lorsqu'on a un truc récursif
				if (extraPropertyName) {
					return fail()
				}
				return pass()
			},
		})
	}

	return createExpectedPropertiesExpectation(expected, createAnonymousTrace(expected)).chain(
		createActualPropertiesExpectation(),
	)
}

export const aThenableResolvedWith = expected => {
	return createExpectation({
		expected,
		compare: ({ actual, pass }) => {
			actual.then(
				value => {
					pass({
						status: "resolved",
						value,
					})
				},
				reason => {
					pass({
						status: "rejected",
						value: reason,
					})
				},
			)
		},
	}).chain(
		propertiesMatch({
			status: exactly("resolved"),
			value: expected,
		}),
	)
}

/*
aFunctionWhich(...expectations)

const findCallExpectations = (value) => {
  // en gros il faut que chaque expectation expose qui elle est
  // ou en tous cas qu'on puisse savoir s'il s'agit d'une callExpectation
  // ça c'est facile
  // ensuite il faut que expectAll, expectSome, expectOneOf
  // permette de lister les expectations qui sont dedans afin de pouvoir les collecter
  // ensuite on a juste a bouclé sur tout ça
  // le premier argument de callExpecting doit être
  // un de expectAll, expectSome, expectOneOf, expectNot ou directement une callExpectation
  // faire quelque chose comme callExpecting(expectExactly(undefined))
  // a pas trop de sens
  // pour le moment cela ignorerais tout simplement les expectation qui ne sont pas des callExpectation
}

const aFunctionWhich = (expected) => {
  const callExpectations = findCallExpectations(expected)

  return createExpectation({ actual, expected, pass, fail }) => {
    const callSideEffectMetas = callExpectations.map(
      ({ setupSideEffect }) => setupSideEffect()
    )
    actual()
    const callSideEffects = callExpectations.map(
      ({ collectSideEffect }, index) => collectSideEffect(callSideEffectMetas[index])
    )
    return pass(callSideEffects)
  }).chain(expectProperties(callExpectations))
})
*/

export const expect = (actual, matcher) => matcher.match(actual)
