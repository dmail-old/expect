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

import { createMatcherFromFunction } from "../matcher.js"
import { sequence } from "@dmail/action"
import { oneOrMoreAllowedBehaviourSignature } from "../behaviour.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { createValueSnapshot, getMutationsFromSnapshot } from "./snapshotValue.js"
import { createSpySnapshot, getCallsFromSnapshot } from "./snapshotSpy.js"
import { whenCalledWith } from "./whenCalledWith.js"
import { willMutatePropertiesOf } from "./willMutatePropertiesOf.js"
import { willNotMutatePropertiesOf } from "./willNotMutatePropertiesOf.js"
import { willMutateArguments } from "./willMutateArguments.js"
import { willCallSpyWith } from "./willCallSpyWith.js"
import { willNotCallSpy } from "./willNotCallSpy.js"
import { willThrowWith } from "./willThrowWith.js"
import { willReturnWith } from "./willReturnWith.js"

const preventOpposite = (positive, negative, compare) => {
	const positiveBehaviour = positive.behaviour
	const negativeBehaviour = negative.behaviour

	positiveBehaviour.opposite = negative
	negativeBehaviour.opposite = positive

	positiveBehaviour.preventOpposite = true
	negativeBehaviour.preventOpposite = true

	positiveBehaviour.compareOpposite = compare
	negativeBehaviour.compareOpposite = compare
}

preventOpposite(willMutatePropertiesOf, willNotMutatePropertiesOf, (a, b) => a.value === b.value)

preventOpposite(willCallSpyWith, willNotCallSpy, (a, b) => a.spy === b.spy)

preventOpposite(willThrowWith, willReturnWith, () => true)

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

const checkDuplicate = (previousBehaviours, behaviour) => {
	if (!behaviour.preventDuplicate) {
		return
	}
	const duplicate = previousBehaviours.find((previousBehaviour) => {
		if (previousBehaviour.behaviour !== behaviour.behaviour) {
			return false
		}
		const { isDuplicate = () => true } = behaviour
		return isDuplicate(behaviour, previousBehaviour)
	})
	if (duplicate) {
		throw new Error(`${behaviour.type} duplicated`)
	}
}

const checkOpposite = (previousBehaviours, behaviour) => {
	if (!behaviour.preventOpposite || !behaviour.opposite) {
		return
	}
	const opposite = previousBehaviours.find((previousBehaviour) => {
		if (previousBehaviour.behaviour !== behaviour.opposite) {
			return false
		}
		const { compareOpposite = () => true } = behaviour
		return compareOpposite(behaviour, previousBehaviour)
	})
	if (opposite) {
		throw new Error(`${behaviour.type} incompatible with previous usage of ${opposite.type}`)
	}
}

const parseBehaviours = (behaviours) => {
	return behaviours.reduce((accumulator, current) => {
		const behaviour = current.behaviour
		checkDuplicate(accumulator, behaviour)
		checkOpposite(accumulator, behaviour)
		debugger

		if (behaviour.split) {
			return accumulator.concat(parseBehaviours(behaviour.split()))
		}
		return accumulator.concat(behaviour)
	}, [])
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

		const assertions = parseBehaviours(behaviours).map((behaviour, index, parsedBehaviours) => {
			return behaviour.expect(behaviour, {
				getIndex: () => index,
				getBehaviours: () => parsedBehaviours,
				setArgValues,
				getArgValues,
				observeMutations,
				observeCalls,
				observeResultState,
				observeResultValue,
			})
		})

		return createMatcherFromFunction(({ actual }) => {
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

				return sequence(assertions, (assertion) => assertion())
			})
		})
	},
)
