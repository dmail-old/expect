/*
- willCallMethodWith(objectOrFunction, methodName, ...expectedArgs)
install a spy on method during function execution
and ensure it gets called with specified args
can be duplicated, and in that case it means we expect method to be called
multiple times but spy doesn't have to re reinstalled in that case

aFunctionWhich(
	willMutatePropertiesOf({}, {
		name: deleted(),
		age: 18,
		count: 5,
	})
)
*/

import { createMatcherFromFunction } from "../matcher.js"
import { sequence, failed, passed } from "@dmail/action"
import { oneOrMoreAllowedBehaviourSignature } from "../behaviour.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { exactProperties } from "../properties/properties.js"
import { getOwnPropertyNamesAndSymbols, canHaveOwnProperty } from "../helper.js"
// import { watchMutation } from "./observeMutations.js"

const watchMutation = () => {}

const createAPI = ({ api, type }) => (...args) => {
	return {
		type,
		...api(...args),
	}
}

const whenCalledWithBehaviour = {
	type: "whenCalledWith",
	api: (...argValues) => ({ argValues }),
	preventDuplicate: true,
	isDuplicate: true,
	expect: ({ argValues }, { setArgValues }) => {
		setArgValues(argValues)
		return () => {}
	},
}

const expectDeletedProperty = {}

const willMutatePropertiesOfBehaviour = {
	type: "willMutatePropertiesOf",
	api: (value, properties) => ({ value, properties }),
	preventDuplicate: true,
	isDuplicate: (self, other) => self.value === other.value,
	expect: ({ value, properties }, { observeMutations }) => {
		const expectedPropertyMutations = getOwnPropertyNamesAndSymbols(properties)
		if (expectedPropertyMutations.length === 0) {
			throw new Error(
				`willMutatePropertiesOf second argument is empty, use willNotMutatePropertiesOf() instead`,
			)
		}

		properties = expectedPropertyMutations.map((nameOrSymbol) => {
			return {
				property: nameOrSymbol,
				mutatedValue: expectedPropertyMutations[nameOrSymbol],
			}
		})

		const getMutations = observeMutations(value)

		return () => {
			const mutations = getMutations()

			return sequence(properties, ({ property, mutatedValue }) => {
				const propertyMutation = mutations.find((mutation) => mutation.property === property)
				if (mutatedValue === expectDeletedProperty) {
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

				// ici il faudrais transformer propertyValue en un matcher
				const propertyValue = value[property]

				if (propertyValue !== mutatedValue) {
					return failed(``)
				}

				return passed()
			}).then(() => {
				const extraMutations = mutations.filter(({ property: actualMutatedProperty }) => {
					return properties.some(({ property: expectedMutatedProperty }) => {
						return actualMutatedProperty !== expectedMutatedProperty
					})
				})
				if (extraMutations.length) {
					return failed(``)
				}
			})
		}
	},
}

const willNotMutatePropertiesOfBehaviour = {
	type: "willNotMutatePropertiesOf",
	api: (value) => ({ value }),
	preventDuplicate: true,
	isDuplicate: (self, other) => self.value === other.value,
	expect: ({ value }, { observeMutations }) => {
		const getMutations = observeMutations(value)

		return () => {
			const mutations = getMutations()
			if (mutations.length) {
				// const mutations = valueMutations.mutations
				// 4 unexpected mutations :
				// bar property updated from ${uneval()} to ${uneval()}
				// stuff property updated from to...
				// foo property added with ${uneval()}
				// name property deleted
				return failed(``)
			}
			return passed()
		}
	},
}

const willMutateArgumentsBehaviour = {
	type: "willMutateArguments",
	api: (...argValues) => ({ argValues }),
	expect: ({ argValues }, { getArgValue }) => {
		argValues.forEach((value, index) => {
			const arg = getArgValue(index)
			if (canHaveOwnProperty(arg)) {
				// comment gérer ce cas?
				// je dirais qu'il faut éxécuter willMutatePropertiesOfBehaviour
				// puis retourner ce qui en résulte, bref
				behaviourHandlers.willMutateProperties({
					value: arg,
					properties: value,
				})
			}
		})
	},
}

const willCallSpyWithBehaviour = {
	type: "willCallSpyWith",
	api: (spy, ...argValues) => ({ spy, argValues }),
	preventDuplicate: false,
	expect: ({ spy, argValues }, { observeCallAtIndex }) => {
		const expectedSpy = spy
		// voir comment on va gérer ça, parce que si on s'en tient au naming
		// observeCall n'indique pas que l'index est important
		// hors c'est le cas ici
		const expectedIndex = finalBehaviours.filter(({ type }) => {
			return type === "willCallSpyWith"
		}).length

		const getActualCall = observeCallAtIndex(expectedIndex)

		return () => {
			const actualCall = getActualCall()

			if (!actualCall) {
				return failed(`missing call to ${expectedSpy}`)
			}

			const actualSpy = actualCall.spy
			const actualTracker = actualCall.tracker

			if (actualSpy !== expectedSpy) {
				return failed(`unexpected call to ${actualSpy}, expecting a call to ${expectedSpy}`)
			}

			const assertArguments = exactProperties(argValues)
			return assertArguments(actualTracker.createReport().argValues).then(null, (message) => {
				return `${actualTracker} call arguments mismatch: ${message}`
			})
		}
	},
}

const willNotCallSpyBehaviour = {
	type: "willNotCallSpy",
	api: (spy) => ({ spy }),
	preventDuplicate: true,
	expect: ({ spy }, { observeSpyCalls }) => {
		const getActualCalls = observeSpyCalls(spy)
		return () => {
			const unexpectedCalls = getActualCalls()
			if (unexpectedCalls.length) {
				// we should add one line per unexpected call to detail each call arguments
				return failed(`${unexpectedCalls.length} unexpected call to ${spy}`)
			}
			return passed()
		}
	},
}

const willThrowWithBehaviour = {
	type: "willThrowWith",
	api: (throwedValue) => ({ throwedValue }),
	preventDuplicate: true,
	expect: ({ throwedValue }, { observeResultState, observeResultValue }) => {
		const getResultState = observeResultState()
		const getResultValue = observeResultValue()

		return () => {
			const state = getResultState()
			if (state === "returned") {
				return failed(`missing throw`)
			}
			return throwedValue(getResultValue())
		}
	},
}

const willReturnWithBehaviour = {
	type: "willReturnWith",
	preventDuplicate: true,
	api: (returnedValue) => ({ returnedValue }),
	expect: ({ returnedValue }, { observeResultValue }) => {
		const getResultValue = observeResultValue()

		return () => {
			return returnedValue(getResultValue())
		}
	},
}

const preventOpposite = (positiveBehaviour, negativeBehaviour, compare) => {
	positiveBehaviour.opposite = negativeBehaviour
	negativeBehaviour.opposite = positiveBehaviour

	positiveBehaviour.preventOpposite = true
	negativeBehaviour.preventOpposite = true

	positiveBehaviour.compareOpposite = compare
	negativeBehaviour.compareOpposite = compare
}

preventOpposite(
	willMutatePropertiesOfBehaviour,
	willNotMutatePropertiesOfBehaviour,
	(a, b) => a.value === b.value,
)

preventOpposite(willCallSpyWithBehaviour, willNotCallSpyBehaviour, (a, b) => a.spy === b.spy)

preventOpposite(willThrowWithBehaviour, willReturnWithBehaviour, () => true)

export const whenCalledWith = createAPI(whenCalledWithBehaviour)

export const deleted = () => expectDeletedProperty

export const willMutatePropertiesOf = createAPI(willMutatePropertiesOfBehaviour)

export const willNotMutatePropertiesOf = createAPI(willNotMutatePropertiesOfBehaviour)

export const willMutateArguments = createAPI(willMutateArgumentsBehaviour)

export const willCallSpyWith = createAPI(willCallSpyWithBehaviour)

export const willNotCallSpy = createAPI(willNotCallSpyBehaviour)

export const willThrowWith = createAPI(willThrowWithBehaviour)

export const willReturnWith = createAPI(willReturnWithBehaviour)

const createLazyGetter = (getter) => {
	const get = () => getter()

	const set = (fn) => {
		getter = fn
	}

	return {
		get,
		set,
	}
}

export const aFunctionWhich = oneOrMoreAllowedBehaviourSignature(
	[
		whenCalledWith,
		willMutatePropertiesOf,
		willNotMutatePropertiesOf,
		willMutateArguments,
		willCallSpyWith,
		willNotCallSpy,
		willThrowWith,
		willReturnWith,
	],
	(...behaviours) => {
		let args = []
		const setArgValues = (values) => {
			args = values
		}

		const mutationObservers = []
		const observeMutations = (value) => {
			const { get, set } = createLazyGetter()

			mutationObservers.push({
				value,
				set,
			})

			return get
		}

		const callObservers = []
		const observeSpyCalls = (spy) => {
			const { get, set } = createLazyGetter()

			callObservers.push({
				map: (calls) => calls.filter((call) => call.spy === spy),
				spy,
				set,
			})

			return get
		}
		const observeSpyCallAtIndex = (index, spy) => {
			const { get, set } = createLazyGetter()

			callObservers.push({
				map: (calls) => calls[index],
				spy,
				set,
			})

			return get
		}

		const { set: setResultStateGetter, get: getResultState } = createLazyGetter()
		let stateObserved = false
		const observeResultState = () => {
			stateObserved = true
			return getResultState
		}

		const { set: setResultValueGetter, get: getResultValue } = createLazyGetter()
		const observeResultValue = () => {
			return getResultValue
		}

		const assertions = behaviours.map((behaviour) => {
			return behaviour.expect(behaviour, {
				setArgValues,
				observeMutations,
				observeSpyCalls,
				observeSpyCallAtIndex,
				observeResultState,
				observeResultValue,
			})
		})

		return createMatcherFromFunction(({ actual }) => {
			return constructedBy(Function)(actual).then(() => {
				mutationObservers.forEach(({ value, set }) => {
					set(watchMutation(value))
				})

				const calls = []
				callObservers.forEach(({ spy, map, set }) => {
					spy.whenCalled((tracker) => {
						calls.push(tracker)
					})
					set(() => map(calls))
				})

				let resultState = "unknown"
				setResultStateGetter(() => resultState)

				let resultValue
				setResultValueGetter(() => resultValue)

				if (stateObserved) {
					try {
						resultValue = actual(...args)
						resultState = "returned"
					} catch (e) {
						resultState = "throwed"
						resultValue = e
					}
				} else {
					resultValue = actual(...args)
					resultState = "returned"
				}

				return sequence(assertions, (assertion) => assertion()).then(() => {
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
