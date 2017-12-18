import { createBehaviourFactory } from "../behaviour.js"
import { getOwnPropertyNamesAndSymbols } from "../helper.js"
import { sequence, failed, passed } from "@dmail/action"

const expectDeletedProperty = {}

export const deleted = () => expectDeletedProperty

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

export const willMutatePropertiesOf = createBehaviourFactory(willMutatePropertiesOfBehaviour)
