import { mixin, pure, hasTalent } from "@dmail/mixin"
import { allPredicate, spreadPredicate, oneOrMoreArgument, oneArgument } from "./signature.js"

const behaviourTalent = () => {}
export const pureBehaviour = mixin(pure, behaviourTalent)

const isBehaviour = (value) => hasTalent(behaviourTalent, value)

export const isBehaviourProducedBy = (factory, behaviour) => behaviour.factory === factory

const createAllowedBehaviourPredicate = (allowedBehaviourFactories) => {
	return spreadPredicate((arg) => {
		if (isBehaviour(arg) === false) {
			return `expect a behaviour but got ${arg}`
		}
		const isAllowed = allowedBehaviourFactories.find((behaviourFactory) => {
			return isBehaviourProducedBy(arg, behaviourFactory)
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
			if (isBehaviourProducedBy(behaviour, behaviourFactory) === false) {
				return
			}
			const existingBehaviour = previousBehaviours.find((previousBehaviour) => {
				return (
					isBehaviourProducedBy(previousBehaviour, behaviourFactory) &&
					compare(behaviour, previousBehaviour)
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
			if (isBehaviourProducedBy(behaviour, positiveBehaviourFactory) === false) {
				return
			}
			const opposite = previousBehaviours.find((previousBehaviour) => {
				return (
					isBehaviourProducedBy(negativeBehaviourFactory) && compare(behaviour, previousBehaviour)
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
			if (isBehaviourProducedBy(behaviour, negativeBehaviourFactory) === false) {
				return
			}
			const opposite = previousBehaviours.find((previousBehaviour) => {
				return (
					isBehaviourProducedBy(positiveBehaviourFactory) && compare(behaviour, previousBehaviour)
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
