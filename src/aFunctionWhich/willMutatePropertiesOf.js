import { createBehaviourFactory } from "../behaviour.js"
import { getOwnPropertyNamesAndSymbols } from "../helper.js"
import { sequence, failed } from "@dmail/action"
import { createAssertionFromFunction } from "../matcher.js"
import { exactProperties } from "../properties/properties"
import { createMutationsMessages } from "./snapshotValue.js"

const expectDeletedProperty = {}

export const deleted = () => expectDeletedProperty

export const willMutatePropertiesOf = createBehaviourFactory((value, properties) => {
	return ({ observeMutations }) => {
		const expectedPropertyMutations = getOwnPropertyNamesAndSymbols(properties)
		if (expectedPropertyMutations.length === 0) {
			throw new Error(
				`willMutatePropertiesOf second argument is empty, use willNotMutatePropertiesOf() instead`,
			)
		}

		const propertyAssertions = expectedPropertyMutations.map((nameOrSymbol) => {
			const descriptor = Object.getOwnPropertyDescriptor(expectedPropertyMutations, nameOrSymbol)

			return {
				property: nameOrSymbol,
				assertion: createAssertionFromFunction(({ actual: mutation, fail, pass }) => {
					if ("value" in descriptor && descriptor.value === expectDeletedProperty) {
						if (mutation.type === "deleted") {
							return pass()
						}
						return fail(`missing ${nameOrSymbol} property deletion by function`)
					}

					if (mutation.type === "deleted") {
						return failed(`unexpected ${nameOrSymbol} property deletion by function`)
					}

					if (mutation.type === "none") {
						return fail(`missing ${nameOrSymbol} property mutation by function`)
					}

					return exactProperties(descriptor, mutation.nextDescriptor).then((message) => {
						return `mutation mismatch: ${message}`
					})
				}),
			}
		})

		const getMutations = observeMutations(value)

		return () => {
			const mutations = getMutations()

			return sequence(propertyAssertions, ({ property, assertion }) => {
				const propertyMutation = mutations.find((mutation) => mutation.property === property)
				return assertion(propertyMutation)
			}).then(() => {
				const extraMutations = mutations.filter((mutation) => {
					return propertyAssertions.some((propertyAssertion) => {
						return mutation.property !== propertyAssertion.property
					})
				})
				if (extraMutations.length) {
					const messages = createMutationsMessages(extraMutations)
					return failed(`${messages.length} extra mutations:
					${messages.join("\n")}`)
				}
			})
		}
	}
})
