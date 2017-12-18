import { getOwnPropertyNamesAndSymbols, hasProperty, canHaveOwnProperty } from "../helper.js"

export const createValueSnapshot = (value) => {
	let propertiesSnapshots
	if (canHaveOwnProperty(value)) {
		propertiesSnapshots = getOwnPropertyNamesAndSymbols(value).map((nameOrSymbol) => {
			// ignore descriptor for now
			// const descriptor = Object.getOwnPropertyDescriptor(value, name)
			const propertySnapshot = createValueSnapshot(value[nameOrSymbol])

			return {
				getProperty: () => nameOrSymbol,
				getSnapshot: () => propertySnapshot,
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

export const getMutationsFromSnapshot = ({ getValue, getPropertiesSnapshots }, value) => {
	const snapshotedProperties = getPropertiesSnapshots()
	const trackedMutations = snapshotedProperties.map(({ getProperty, getSnapshot }) => {
		const property = getProperty()
		const propertySnapshot = getSnapshot()
		const propertySnapshotValue = propertySnapshot.getValue()
		const common = {
			property,
			value: propertySnapshotValue,
		}

		if (hasProperty(value, property) === false) {
			return { ...common, type: "deleted" }
		}
		const propertyValue = value[property]
		if (propertyValue !== propertySnapshotValue) {
			return { ...common, type: "updated" }
		}
		return { ...common, type: "none" }
	})

	const propertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(value)
	const untrackedMutations = propertyNamesAndSymbols
		.filter((nameOrSymbol) => {
			return snapshotedProperties.some(({ getProperty }) => getProperty() === nameOrSymbol)
		})
		.map((nameOrSymbol) => {
			return {
				property: nameOrSymbol,
				value: undefined,
				type: "added",
			}
		})

	return trackedMutations.concat(untrackedMutations)
}
