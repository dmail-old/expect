import {
	allPredicate,
	createSignature,
	spreadPredicate,
	oneOrMoreArgumentPredicate,
	oneArgumentPredicate,
} from "./signature.js"

export const createBehaviourFactory = name => {
	const createBehaviour = (...args) => {
		return {
			name,
			args,
		}
	}
	createBehaviour.name = name
	return createBehaviour
}

export const isBehaviour = value => typeof value === "function"

export const isBehaviourOf = (factory, value) => value && factory.name === value.name

const createAllowedBehaviourPredicate = allowedBehaviours => value => {
	const allowedBehaviourNames = allowedBehaviours.map(behaviour => behaviour.name).join(",")

	return allPredicate(allowedBehaviours, allowedBehaviour => {
		if (isBehaviour(value)) {
			return `expect a behaviour but got ${value}`
		}
		if (isBehaviourOf(allowedBehaviour, value) === false) {
			return `unexpected ${value}, must only be one of ${allowedBehaviourNames}`
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
