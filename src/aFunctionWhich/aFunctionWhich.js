/*
to be added and tested

- willCallMethodWith(objectOrFunction, methodName, ...expectedArgs)
install a spy on method during function execution
and ensure it gets called with specified args
can be duplicated, and in that case it means we expect method to be called
multiple times but spy doesn't have to re reinstalled in that case

// aFunctionWhich(
// 	willMutatePropertiesOf({}, {
// 		name: deleted(),
// 		age: 18,
// 		count: 5,
// 	})
// )
// pour s'attendre à ce que ça mutate rien on peut écrire
// willMutatePropertiesOf({}, {})
// mais on fera surement un willNotMutatePropertiesOf

*/

import { createMatcherFromFunction } from "../matcher.js"
import { sequence, failed, passed } from "@dmail/action"
import { oneOrMoreAllowedBehaviourSignature } from "../behaviour.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { exactProperties } from "../properties/properties.js"
import { getOwnPropertyNamesAndSymbols, hasProperty, canHaveOwnProperty } from "../helper.js"

export const whenCalledWith = (...argValues) => ({
	type: "whenCalledWith",
	argValues,
})

const expectDeletedProperty = {}
export const deleted = () => expectDeletedProperty

export const willMutatePropertiesOf = (value, properties) => ({
	type: "willMutatePropertiesOf",
	value,
	properties,
})

export const willMutateArguments = (...argValues) => ({
	type: "willMutateArguments",
	argValues,
})

export const willCallSpyWith = (spy, ...argValues) => ({
	type: "willCallSpyWith",
	spy,
	argValues,
})

export const willNotCallSpy = (spy) => ({
	type: "willNotCallSpy",
	spy,
})

export const willThrowWith = (throwedValue) => ({
	type: "willThrowWith",
	throwedValue,
})

export const willReturnWith = (returnedValue) => ({
	type: "willReturnWith",
	returnedValue,
})

const observeMutations = (targets) => {
	const observeMutation = (target) => {
		const propertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(target)
		const propertyMutationObservers = propertyNamesAndSymbols.map((nameOrSymbol) => {
			const get = () => target[nameOrSymbol]

			const value = get()

			const getMutation = () => {
				if (hasProperty(target, nameOrSymbol) === false) {
					return {
						property: nameOrSymbol,
						value,
						type: "deleted",
					}
				}
				const newValue = get()
				if (value !== newValue) {
					return {
						property: nameOrSymbol,
						value,
						type: "updated",
					}
				}
				return {
					property: nameOrSymbol,
					value,
					type: "none",
				}
			}

			return getMutation
		})

		return () => {
			const nextPropertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(target)
			const propertyAndSymbolsMutations = propertyMutationObservers.map((getMutation) =>
				getMutation(),
			)
			const addedPropertiesAndSymbols = nextPropertyNamesAndSymbols.filter((nameOrSymbol) => {
				return propertyNamesAndSymbols.includes(nameOrSymbol) === false
			})
			const addedMutations = addedPropertiesAndSymbols.map((nameOrSymbol) => {
				return {
					name: nameOrSymbol,
					value: undefined,
					type: "added",
				}
			})

			return propertyAndSymbolsMutations.concat(addedMutations)
		}
	}

	const getters = targets.map((target) => observeMutation(target))

	return () =>
		getters.map((getter, index) => {
			return {
				value: targets[index],
				mutations: getter(),
			}
		})
}

const observeCalls = (spies) => {
	const actualCalls = []

	spies.forEach((spy) => {
		spy.whenCalled((tracker) => {
			actualCalls.push({ spy, tracker })
		})
	})

	return () => actualCalls
}

const behaviourAssertions = {
	willMutateProperty: (behaviour, index, behaviours, { mutations }) => {
		const { value, property, expected } = behaviour
		const valueMutations = mutations.find((mutation) => mutation.value === value).mutations
		const propertyMutation = valueMutations.find((mutation) => mutation.property === property)

		if (expected === expectDeletedProperty) {
			if (propertyMutation.type === "deleted") {
				return passed()
			}
			return failed(`missing ${property} property deletion by function`)
		}

		if (propertyMutation.type === "none") {
			return failed(`missing ${property} property mutation by function`)
		}

		if (propertyMutation.type === "deleted") {
			return failed(`unexpected ${property} property deletion by function`)
		}

		return expected(value[property])
	},

	willCallSpyWith: (behaviour, index, behaviours, { calls }) => {
		const [spy, ...args] = behaviour.args
		const expectedCallIndex = 0 // à calculer en fonction du nombre de behaviour
		// précédent celui ci qui sont du même type
		const expectedSpy = spy
		const actualCall = calls[expectedCallIndex]

		if (!actualCall) {
			return failed(`missing call to ${expectedSpy}`)
		}

		const actualSpy = actualCall.spy
		const actualTracker = actualCall.tracker

		if (actualSpy !== expectedSpy) {
			return failed(`unexpected call to ${actualSpy}, expecting a call to ${expectedSpy}`)
		}

		const assertArguments = exactProperties(args)
		return assertArguments(actualTracker.createReport().argValues).then(null, (message) => {
			return `${actualTracker} call arguments mismatch: ${message}`
		})
	},

	willNotCallSpy: (behaviour, index, behaviours, { calls }) => {
		const expectedSpy = behaviour.args[0]
		const unexpectedCalls = calls.filter((call) => {
			return call.spy === expectedSpy
		})
		if (unexpectedCalls.length) {
			const firstInvalidCall = unexpectedCalls[0]
			return failed(`unexpected call to ${firstInvalidCall.spy}`)
		}
		return passed()
	},

	willThrowWith: (behaviour, index, behaviours, { result }) => {
		const { state, value } = result
		if (state === "returned") {
			return failed(`missing throw`)
		}
		return behaviour.args[0](value)
	},

	willReturnWith: (behaviour, index, behaviours, { result }) => {
		const { value } = result
		return behaviour.args[0](value)
	},
}

export const aFunctionWhich = oneOrMoreAllowedBehaviourSignature(
	[
		whenCalledWith,
		willMutatePropertiesOf,
		willMutateArguments,
		willCallSpyWith,
		willNotCallSpy,
		willThrowWith,
		willReturnWith,
	],
	(...behaviours) => {
		let args = []
		let whenCalledWithBehaviour
		let mutateArgumentsBehaviour

		const finalBehaviours = []

		const hasBehaviourOfType = (someType) => finalBehaviours.some(({ type }) => type === someType)

		const spyMustBeCalled = (someSpy) => {
			return finalBehaviours.some(({ type, spy }) => type === "willCallSpyWith" && spy === someSpy)
		}

		const spyMustNotBeCalled = (someSpy) => {
			return finalBehaviours.some(({ type, spy }) => type === "willNotCallSpy" && spy === someSpy)
		}

		const behaviourHandlers = {
			whenCalledWith: (behaviour) => {
				if (whenCalledWithBehaviour) {
					throw new Error(`cannot use whenCalledWith twice`)
				}
				whenCalledWithBehaviour = behaviour

				args = behaviour.args
			},

			willMutatePropertyOf: ({ value, property, expected }) => {
				const existing = finalBehaviours.find(
					(behaviour) =>
						behaviour.type === "willMutatePropertyOf" &&
						behaviour.value === value &&
						behaviour.property === property,
				)
				if (existing) {
					if (existing.expected === expectDeletedProperty && expected === expectDeletedProperty) {
						throw new Error(`cannot override existing ${property} property expected deletion`)
					}
					throw new Error(`cannot override existing ${property} property expected mutation`)
				}
				finalBehaviours.push({
					type: "willMutatePropertyOf",
					value,
					property,
					expected,
				})
			},

			willMutatePropertiesOf: ({ value, properties }) => {
				if (
					behaviours.some(
						({ type, value: behaviourValue }) =>
							type === "willMutatePropertiesOf" && behaviourValue === value,
					)
				) {
					throw new Error(`cannot use willMutatePropertiesOf twice on same value`)
				}
				const expectedPropertyMutations = getOwnPropertyNamesAndSymbols(properties)
				expectedPropertyMutations.forEach((nameOrSymbol) => {
					behaviourHandlers.willMutatePropertyOf({
						value,
						property: nameOrSymbol,
						expected: expectedPropertyMutations[nameOrSymbol],
					})
				})
			},

			willMutateArguments: ({ values }) => {
				if (mutateArgumentsBehaviour) {
					throw new Error(`cannot use willMutateArguments twice`)
				}
				mutateArgumentsBehaviour = true

				values.forEach((value, index) => {
					const arg = args[index]
					if (canHaveOwnProperty(arg)) {
						behaviourHandlers.willMutateProperties({
							value: arg,
							properties: value,
						})
					}
				})
			},

			willCallSpyWith: ({ spy, argValues }) => {
				if (spyMustNotBeCalled(spy)) {
					throw new Error(`cannot use callSpyWith on a spy which was used by neverCallSpy`)
				}
				finalBehaviours.push({
					type: "willCallSpyWith",
					spy,
					argValues,
				})
			},

			willNotCallSpy: ({ spy }) => {
				if (spyMustBeCalled(spy)) {
					throw new Error(`cannot use callSpyWith on a spy which was used by neverCallSpy`)
				}
				finalBehaviours.push({
					type: "willNotCallSpy",
					spy,
				})
			},

			willThrowWith: ({ throwedValue }) => {
				if (hasBehaviourOfType("willReturnWith")) {
					throw new Error(`cannot use throwWith once you have used returnWith`)
				}
				if (hasBehaviourOfType("willThrowWith")) {
					throw new Error(`cannot use throwWith twice`)
				}
				finalBehaviours.push({
					type: "willThrowWith",
					throwedValue,
				})
			},

			willReturnWith: ({ returnedValue }) => {
				if (hasBehaviourOfType("willThrowWith")) {
					throw new Error(`cannot use returnWith once you have used throwWith`)
				}
				if (hasBehaviourOfType("willReturnWith")) {
					throw new Error(`cannot use returnWith twice`)
				}
				finalBehaviours.push({
					type: "willReturnWith",
					returnedValue,
				})
			},
		}

		const handleExpectedBehaviour = (behaviour) => {
			const { type } = behaviour
			behaviourHandlers[type](behaviour)
		}

		behaviours.forEach((behaviour) => handleExpectedBehaviour(behaviour))

		const targets = finalBehaviours
			.filter(({ type }) => type === "willMutatePropertyOf")
			.map(({ value }) => value)
			.filter((value, index, self) => self.indexOf(value) === index)

		const spies = finalBehaviours
			.filter(({ type }) => type === "willCallSpyWith" || type === "willNotCallSpy")
			.map(({ spy }) => spy)
			.filter((spy, index, self) => self.indexOf(spy) === index)

		return createMatcherFromFunction(({ actual }) => {
			return constructedBy(Function)(actual).then(() => {
				let returned = false
				let throwedValue
				let returnedValue

				const getCalls = observeCalls(spies)
				const getMutations = observeMutations(targets)

				if (hasBehaviourOfType("willThrowWith")) {
					try {
						returnedValue = actual(...args)
					} catch (e) {
						returned = false
						throwedValue = e
					}
				} else {
					returnedValue = actual(...args)
					returned = true
				}

				const mutations = getMutations()
				const calls = getCalls()
				const result = {
					state: returned ? "returned" : "throwed",
					value: returned ? returnedValue : throwedValue,
				}

				return sequence(finalBehaviours, (behaviour, index) => {
					return behaviourAssertions[behaviour.type](behaviour, index, { mutations, calls, result })
				})
					.then(() => {
						// we must ensure there is no extra mutations
						mutations.forEach((mutation) => {
							const valueMutations = mutation.mutations
							const expectedValueMutations = []
							if (valueMutations.length > expectedValueMutations.length) {
								// les extra mutation sont celles qui portent sur des propriété
								// non traquées
							}
						})
					})
					.then(() => {
						// ici faut s'assurer que y'a pas d'extra calls
						// const extraCalls = calls.slice(expectedCalls.length)
						// if (extraCalls.length) {
						// 	const firstExtraCall = extraCalls[0]
						// 	let message = `unexpected call to ${firstExtraCall.spy}`
						// 	if (extraCalls.length > 1) {
						// 		message += ` and ${extraCalls.length - 1} more`
						// 	}
						// 	return failed(message)
						// }
					})
			})
		})
	},
)
