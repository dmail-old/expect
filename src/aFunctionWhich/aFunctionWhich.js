/*
it would be way easier, when asserting we don't mutate an object
to just do Object.freeze on it and let throw but
- without use strict is silently fails
- it makes the object non extensible so test code cannot reuse it later
- error message will be less sexy

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

/* eslint-disable import/max-dependencies */

import { isProductOf } from "@dmail/mixin"
import { createAssertionFromFunction } from "../matcher.js"
import { sequence } from "@dmail/action"
import { sign } from "../signature.js"
import { oneOrMoreAllowedBehaviour, createBehaviourParser } from "../behaviour.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { createValueSnapshot, getMutationsFromSnapshot } from "./snapshotValue.js"
import { createSpySnapshot, getCallsFromSnapshot } from "./snapshotSpy.js"
// import { whenCalledWith } from "./whenCalledWith.js"
// import { willMutatePropertiesOf } from "./willMutatePropertiesOf.js"
// import { willNotMutatePropertiesOf } from "./willNotMutatePropertiesOf.js"
// import { willMutateArguments } from "./willMutateArguments.js"
import { willCallSpyWith } from "./willCallSpyWith.js"
import { willNotCallSpy } from "./willNotCallSpy.js"
import { willThrowWith } from "./willThrowWith.js"
import { willReturnWith } from "./willReturnWith.js"

const { preventDuplicate, preventOpposite, parse } = createBehaviourParser()

// preventDuplicate(willMutatePropertiesOf, (a, b) => a.value === b.value)
// preventDuplicate(willNotMutatePropertiesOf, (a, b) => a.value === b.value)
// preventOpposite(willMutatePropertiesOf, willNotMutatePropertiesOf, (a, b) => a.value === b.value)
preventOpposite(willCallSpyWith, willNotCallSpy, (a, b) => a.spy === b.spy)
preventOpposite(willThrowWith, willReturnWith)
preventDuplicate(willThrowWith, willReturnWith)

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

const createUnexpectedBehaviourMessage = ({ fn, behaviour, param }) => {
	const functionName = fn.name ? `${fn.name} function` : "function"

	if (behaviour.createExpectedDescription) {
		return `actual:
${behaviour.createActualDescription({ fn: functionName, ...param })}

expected:
${behaviour.createExpectedDescription({ fn: functionName })}
`
	}

	if (isProductOf(willReturnWith, behaviour)) {
		return `unexpected ${functionName} return value:
${param}`
	}

	return param
}

export const aFunctionWhich = sign(
	oneOrMoreAllowedBehaviour([
		// whenCalledWith,
		// willMutatePropertiesOf,
		// willNotMutatePropertiesOf,
		// willMutateArguments,
		willCallSpyWith,
		willNotCallSpy,
		willThrowWith,
		willReturnWith,
	]),
	(...behaviours) => {
		let args = []
		const setArgValues = (values) => {
			args = values
		}
		const getArgValues = () => args

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
		const observeCalls = (spy) => {
			const { get, set } = createLazyGetter()

			callObservers.push({
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

		behaviours = parse(behaviours, { getArgValues })

		const assertions = behaviours.map((behaviour, index) => {
			return behaviour.assert({
				index,
				behaviours,
				setArgValues,
				getArgValues,
				observeMutations,
				observeCalls,
				observeResultState,
				observeResultValue,
			})
		})

		return createAssertionFromFunction(({ actual }) => {
			return constructedBy(Function)(actual).then(() => {
				const valueSnapshots = mutationObservers.map(({ value }) => createValueSnapshot(value))
				const spySnapshots = callObservers.map(({ spy }) => createSpySnapshot(spy))

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

				mutationObservers.forEach(({ value, set }, index) => {
					set(() => getMutationsFromSnapshot(valueSnapshots[index], value))
				})
				callObservers.forEach(({ spy, set }, index) => {
					set(() => getCallsFromSnapshot(spySnapshots[index], spy))
				})

				return sequence(assertions, (assertion, index) => {
					return assertion().then(null, (param) => {
						const behaviour = behaviours[index]
						return createUnexpectedBehaviourMessage({ fn: actual, behaviour, param })
					})
				}).then(() => undefined)
			})
		})
	},
)
