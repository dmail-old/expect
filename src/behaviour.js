import {
	allPredicate,
	createSignature,
	spreadPredicate,
	oneOrMoreArgumentPredicate,
	oneArgumentPredicate,
} from "./signature.js"

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

const createAllowedBehaviourPredicate = (allowedBehaviours) => (value) => {
	const allowedBehaviourTypes = allowedBehaviours.map((behaviour) => behaviour.type).join(",")

	return allPredicate(allowedBehaviours, (allowedBehaviour) => {
		if (isBehaviour(value)) {
			return `expect a behaviour but got ${value}`
		}
		if (isBehaviourOf(allowedBehaviour, value) === false) {
			return `unexpected ${value}, must only be one of ${allowedBehaviourTypes}`
		}
	})
}

export const oneAllowedBehaviourSignature = (allowedBehaviours, fn) => {
	return createSignature(
		allPredicate(oneArgumentPredicate, createAllowedBehaviourPredicate(allowedBehaviours)),
	)(fn)
}

export const oneOrMoreAllowedBehaviourSignature = (allowedBehaviours, fn) => {
	return createSignature(
		allPredicate(
			oneOrMoreArgumentPredicate,
			spreadPredicate(createAllowedBehaviourPredicate(allowedBehaviours)),
		),
	)(fn)
}
