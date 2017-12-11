/*
to be added and tested

- isPureRegardingArguments()
argument must not be modified (each passed objectOrFunction must remain the same)
cannot be duplicated like throwWith or returnWith

- mutateArguments({name: 'dam'}, {index: 2})
ensure first & second argument properties are mutated

- isPureRegarding(objectOrFunction)
this specific object must not be modified by function execution
will throw if this objectOrfunction has already a behaviour saying it should be mutated

- mutate(objectOrFunction, {"foo": matchAny()})
objectOrFunction added/modified properties will be passed to matcher
will throw if this objectOrFunction has already a heaviour saying it should be pure

*/

import { createMatcherFromFunction } from "../matcher.js"
import { sequence, failed, chainFunctions } from "@dmail/action"
import {
	createBehaviourFactory,
	isBehaviourOf,
	oneOrMoreAllowedBehaviourSignature,
} from "../behaviour.js"
import { constructedBy } from "../constructedBy/constructedBy.js"
import { exactProperties } from "../properties/properties.js"

export const whenCalledWith = createBehaviourFactory("whenCalledWith")

export const throwWith = createBehaviourFactory("throwWith")

export const returnWith = createBehaviourFactory("returnWith")

export const callSpyWith = createBehaviourFactory("callSpyWith")

export const neverCallSpy = createBehaviourFactory("neverCallSpy")

export const aFunctionWhich = oneOrMoreAllowedBehaviourSignature(
	[whenCalledWith, callSpyWith, throwWith, returnWith],
	(...behaviours) => {
		let args = []
		let whenCalledWithBehaviour
		let throwBehaviour
		let returnBehaviour
		const expectedCalls = []
		const unexpectedCalls = []

		const spyMustBeCalled = (spy) => expectedCalls.some((expectedCall) => expectedCall.spy === spy)
		const spyMustNeverBeCalled = (spy) =>
			unexpectedCalls.some((unexpectedCall) => unexpectedCall.spy === spy)

		behaviours.forEach((behaviour) => {
			if (isBehaviourOf(whenCalledWith, behaviour)) {
				if (whenCalledWithBehaviour) {
					throw new Error(`cannot use whenCalledWith twice`)
				}
				whenCalledWithBehaviour = behaviour
				args = behaviour.args
				return
			}

			if (isBehaviourOf(callSpyWith, behaviour)) {
				const spy = behaviour.args[0]
				if (spyMustNeverBeCalled(spy)) {
					throw new Error(`cannot use callSpyWith on a spy which was used by neverCallSpy`)
				}
				const assertArguments = exactProperties(behaviour.args.slice(1))
				expectedCalls.push({
					spy,
					assert: createMatcherFromFunction(({ actual }) => {
						return assertArguments(actual.createReport().argValues).then(null, (message) => {
							return `${actual} call arguments mismatch: ${message}`
						})
					}),
				})
				return
			}

			if (isBehaviourOf(neverCallSpy, behaviour)) {
				const spy = behaviour.args[0]
				if (spyMustBeCalled(spy)) {
					throw new Error(`cannot use callSpyWith on a spy which was used by neverCallSpy`)
				}
				unexpectedCalls.push({ spy })
				return
			}

			if (isBehaviourOf(throwWith, behaviour)) {
				if (returnBehaviour) {
					throw new Error(`cannot use throwWith once you have used returnWith`)
				}
				if (throwBehaviour) {
					throw new Error(`cannot use throwWith twice`)
				}
				throwBehaviour = behaviour
				return
			}

			if (isBehaviourOf(returnWith, behaviour)) {
				if (returnBehaviour) {
					throw new Error(`cannot use returnWith once you have used throwWith`)
				}
				if (throwBehaviour) {
					throw new Error(`cannot use returnWith twice`)
				}
				returnBehaviour = behaviour
				return
			}
		})

		const spies = expectedCalls
			.map((expectedCall) => expectedCall.spy)
			.concat(unexpectedCalls.map((unexpectedCall) => unexpectedCall.spy))
			// ensure uniqness of spy
			.filter((spy, index, self) => self.indexOf(spy) === index)

		const assertCalls = createMatcherFromFunction(({ actual: actualCalls }) => {
			return sequence(expectedCalls, (expectedCall, index) => {
				const expectedSpy = expectedCall.spy
				const actualCall = actualCalls[index]

				if (!actualCall) {
					return failed(`missing call to ${expectedSpy}`)
				}

				const actualSpy = actualCall.spy
				const actualTracker = actualCall.tracker

				if (actualSpy !== expectedSpy) {
					return failed(`unexpected call to ${actualSpy}, expecting a call to ${expectedSpy}`)
				}
				return expectedCall.assert(actualTracker)
			})
				.then(() => {
					const extraCalls = actualCalls.slice(expectedCalls.length)
					if (extraCalls.length) {
						const firstExtraCall = extraCalls[0]
						let message = `unexpected call to ${firstExtraCall.spy}`
						if (extraCalls.length > 1) {
							message += ` and ${extraCalls.length - 1} more`
						}
						return failed(message)
					}
				})
				.then(() => {
					const invalidCalls = actualCalls.filter((actualCall) =>
						spyMustNeverBeCalled(actualCall.spy),
					)
					if (invalidCalls.length) {
						const firstInvalidCall = invalidCalls[0]
						return failed(`unexpected call to ${firstInvalidCall.spy}`)
					}
				})
		})

		const assertState = createMatcherFromFunction(({ actual, fail }) => {
			const { state, value } = actual
			if (throwBehaviour) {
				if (state === "returned") {
					return fail(`missing throw`)
				}
				return throwBehaviour.args[0](value)
			}
			if (returnBehaviour) {
				return returnBehaviour.args[0](value)
			}
		})

		const createActualCallsGetter = () => {
			const actualCalls = []
			spies.forEach((spy) => {
				spy.whenCalled((tracker) => {
					actualCalls.push({ spy, tracker })
				})
			})
			return () => actualCalls
		}

		return createMatcherFromFunction(({ actual }) => {
			return constructedBy(Function)(actual).then(() => {
				let returned = false
				let throwedValue
				let returnedValue

				const getActualCalls = createActualCallsGetter()

				if (throwBehaviour) {
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

				return chainFunctions(
					() => assertCalls(getActualCalls()),
					() =>
						assertState({
							state: returned ? "returned" : "throwed",
							value: returned ? returnedValue : throwedValue,
						}),
				)
			})
		})
	},
)
