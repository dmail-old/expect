import { getOwnPropertyNamesAndSymbols, hasProperty } from "../helper.js"

const observeMutation = (target) => {
	const propertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(target)
	const propertyMutationObservers = propertyNamesAndSymbols.map((nameOrSymbol) => {
		const get = () => target[nameOrSymbol]

		const value = get()

		const getMutation = () => {
			if (hasProperty(target, nameOrSymbol) === false) {
				return {
					property: nameOrSymbol,
					value,
					type: "deleted",
				}
			}
			const newValue = get()
			if (value !== newValue) {
				return {
					property: nameOrSymbol,
					value,
					type: "updated",
				}
			}
			return {
				property: nameOrSymbol,
				value,
				type: "none",
			}
		}

		return getMutation
	})

	return () => {
		const nextPropertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(target)
		const propertyAndSymbolsMutations = propertyMutationObservers.map((getMutation) =>
			getMutation(),
		)
		const addedPropertiesAndSymbols = nextPropertyNamesAndSymbols.filter((nameOrSymbol) => {
			return propertyNamesAndSymbols.includes(nameOrSymbol) === false
		})
		const addedMutations = addedPropertiesAndSymbols.map((nameOrSymbol) => {
			return {
				name: nameOrSymbol,
				value: undefined,
				type: "added",
			}
		})

		return propertyAndSymbolsMutations.concat(addedMutations)
	}
}

export const observeMutations = (targets) => {
	const getters = targets.map((target) => observeMutation(target))

	return () => getters.map((getter) => getter())
}
