import { allPredicate, spreadPredicate, oneOrMoreArgument, oneArgument } from "./signature.js"

export const createBehaviourFactory = (behaviour) => {
	const factory = (...args) => {
		return {
			behaviour,
			...behaviour.api(...args),
		}
	}
	factory.behaviour = behaviour
	return factory
}

export const isBehaviour = (value) =>
	typeof value === "object" && typeof value.behaviour === "object"

export const isBehaviourOf = (behaviour, value) => value && value.behaviour === behaviour

const createAllowedBehaviourPredicate = (allowedBehaviours) => {
	return spreadPredicate((arg) => {
		if (isBehaviour(arg) === false) {
			return `expect a behaviour but got ${arg}`
		}
		const isAllowed = allowedBehaviours.find((allowedBehaviour) => {
			return isBehaviourOf(allowedBehaviour, arg)
		})
		if (isAllowed === false) {
			return `unexpected behaviour`
		}
	})
}

export const oneAllowedBehaviour = (allowedBehaviours) =>
	allPredicate(oneArgument, createAllowedBehaviourPredicate(allowedBehaviours))

export const oneOrMoreAllowedBehaviour = (allowedBehaviours) =>
	allPredicate(
		oneOrMoreArgument,
		spreadPredicate(createAllowedBehaviourPredicate(allowedBehaviours)),
	)
