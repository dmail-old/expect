import { getOwnPropertyNamesAndSymbols, canHaveOwnProperty } from "../helper.js"
import { uneval } from "@dmail/uneval"

export const createValueSnapshot = (value) => {
	let propertiesSnapshots
	if (canHaveOwnProperty(value)) {
		propertiesSnapshots = getOwnPropertyNamesAndSymbols(value).map((nameOrSymbol) => {
			const descriptor = Object.getOwnPropertyDescriptor(value, nameOrSymbol)
			const valueSnapshot = "value" in descriptor ? createValueSnapshot(descriptor.value) : null

			return {
				getProperty: () => nameOrSymbol,
				getDescriptor: () => descriptor,
				getValueSnapshot: () => valueSnapshot,
			}
		})
	} else {
		propertiesSnapshots = []
	}

	return {
		getValue: () => value,
		getPropertiesSnapshots: () => propertiesSnapshots,
	}
}

const descriptorAttributes = ["value", "enumerable", "configurable", "writable", "set", "get"]

export const getMutationsFromSnapshot = ({ getValue, getPropertiesSnapshots }, value) => {
	const snapshotedProperties = getPropertiesSnapshots()
	const trackedMutations = snapshotedProperties.map(
		({ getProperty, getSnapshot, getValueSnapshot }) => {
			const property = getProperty()
			const descriptorSnapshot = getSnapshot()
			const descriptor = Object.getOwnPropertyDescriptor(value, property)
			const common = {
				property,
				descriptor: descriptorSnapshot,
				nextDescriptor: descriptor,
			}

			if (!descriptor) {
				return { ...common, type: "deleted" }
			}

			const updatedAttributes = descriptorAttributes.filter(
				(name) => descriptorSnapshot[name] !== descriptor[name],
			)

			if (updatedAttributes.length) {
				return { ...common, type: "updated", attributes: updatedAttributes }
			}

			if ("value" in descriptorSnapshot === false) {
				return { ...common, type: "none" }
			}

			const propertyValueSnapshot = getValueSnapshot()
			const propertiesMutations = getMutationsFromSnapshot(
				propertyValueSnapshot,
				descriptorSnapshot.value,
			)
			if (propertiesMutations.length === 0) {
				return { ...common, type: "none" }
			}
			return { ...common, type: "mutated", mutations: propertiesMutations }
		},
	)

	const propertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(value)
	const untrackedMutations = propertyNamesAndSymbols
		.filter((nameOrSymbol) => {
			return snapshotedProperties.some(({ getProperty }) => getProperty() === nameOrSymbol)
		})
		.map((nameOrSymbol) => {
			return {
				type: "added",
				property: nameOrSymbol,
				descriptor: undefined,
				nextDescriptor: Object.getOwnPropertyDescriptor(value, nameOrSymbol),
			}
		})

	return trackedMutations.concat(untrackedMutations)
}

export const createMutationsMessages = (mutations) => {
	return mutations
		.filter((mutation) => mutation.type !== "none")
		.reduce((accumulator, mutation) => {
			if (mutation.type === "deleted") {
				return accumulator.concat(`${String(mutation.property)} deleted`)
			}
			if (mutation.type === "added" || mutation.type === "updated") {
				const action = mutation.type === "added" ? "add" : "update"

				const modifiedAttributes = mutations.attributes
				if (modifiedAttributes.length === 1) {
					const modifiedAttribute = modifiedAttributes[0]
					return accumulator.concat(
						`${action} ${String(mutation.property)} ${modifiedAttribute} to ${uneval(
							mutation.nextDescriptor[modifiedAttribute],
						)} from ${uneval(mutation.descriptor[modifiedAttribute])}`,
					)
				}
				return accumulator.concat(
					`${action} ${String(mutation.property)} definition to ${uneval(
						mutation.nextDescriptor,
					)} from ${uneval(mutation.descriptor.value)}`,
				)
			}

			if (mutation.type === "mutated") {
				// faudrais filter mutation.mutations qui sont none
				return accumulator.concat(createMutationsMessages(mutation.mutations))
			}
			return accumulator
		}, [])
}
