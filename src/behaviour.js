import { createFactory, pure, isProductOf } from "@dmail/mixin"
import { allPredicate, spreadPredicate, oneOrMoreArgument, oneArgument } from "./signature.js"

const createBehaviour = createFactory(pure, () => {})

export const pureBehaviour = createBehaviour()

const isBehaviour = (value) => isProductOf(createBehaviour, value)

const createAllowedBehaviourPredicate = (allowedBehaviourFactories) => {
	return spreadPredicate((arg) => {
		if (isBehaviour(arg) === false) {
			return `expect a behaviour but got ${arg}`
		}
		const isAllowed = allowedBehaviourFactories.find((behaviourFactory) => {
			return isProductOf(behaviourFactory, arg)
		})
		if (isAllowed === false) {
			return `unexpected behaviour`
		}
	})
}

export const oneAllowedBehaviour = (allowedBehaviourFactories) =>
	allPredicate(oneArgument, createAllowedBehaviourPredicate(allowedBehaviourFactories))

export const oneOrMoreAllowedBehaviour = (allowedBehaviourFactories) =>
	allPredicate(
		oneOrMoreArgument,
		spreadPredicate(createAllowedBehaviourPredicate(allowedBehaviourFactories)),
	)

export const createBehaviourParser = () => {
	// tout le concept de rules + parseBehaviours va passer dans behaviour.js
	const rules = []

	const preventDuplicate = (behaviourFactory, compare = () => true) => {
		rules.push((previousBehaviours, behaviour) => {
			if (isProductOf(behaviourFactory, behaviour) === false) {
				return
			}
			const existingBehaviour = previousBehaviours.find((previousBehaviour) => {
				return (
					isProductOf(behaviourFactory, previousBehaviour) && compare(behaviour, previousBehaviour)
				)
			})
			if (existingBehaviour) {
				throw new Error(`${behaviourFactory.name} behaviour duplicated`)
			}
		})
	}

	const preventOpposite = (
		positiveBehaviourFactory,
		negativeBehaviourFactory,
		compare = () => true,
	) => {
		rules.push((previousBehaviours, behaviour) => {
			if (isProductOf(positiveBehaviourFactory, behaviour) === false) {
				return
			}
			const opposite = previousBehaviours.find((previousBehaviour) => {
				return (
					isProductOf(negativeBehaviourFactory, previousBehaviour) &&
					compare(behaviour, previousBehaviour)
				)
			})
			if (opposite) {
				throw new Error(
					`${positiveBehaviourFactory.name} incompatible with previous usage of ${
						negativeBehaviourFactory.name
					}`,
				)
			}
		})

		rules.push((previousBehaviours, behaviour) => {
			if (isProductOf(negativeBehaviourFactory, behaviour) === false) {
				return
			}
			const opposite = previousBehaviours.find((previousBehaviour) => {
				return (
					isProductOf(positiveBehaviourFactory, previousBehaviour) &&
					compare(behaviour, previousBehaviour)
				)
			})
			if (opposite) {
				throw new Error(
					`${negativeBehaviourFactory.name} incompatible with previous usage of ${
						positiveBehaviourFactory.name
					}`,
				)
			}
		})
	}

	const parse = (behaviours, context) => {
		return behaviours.reduce((accumulator, current) => {
			const parseBehaviour = () => {
				rules.forEach((rule) => rule(accumulator, current))
				if (current.split) {
					current.split(context).forEach((child) => parseBehaviour(child))
				} else {
					accumulator.push(current)
				}
			}
			parseBehaviour(current)
			return accumulator
		}, [])
	}

	return { preventDuplicate, preventOpposite, parse }
}
