import { mixin, pure, hasTalent } from "@dmail/mixin"
import { uneval } from "@dmail/uneval"
// import { reduce } from "@dmail/action"

// const reduce = (array, reducer, initialValue) => array.reduce(reducer, initialValue)

const collectContracts = (contract) => {
	const contracts = []
	let previous = contract.previous
	while (previous) {
		contracts.unshift(previous)
		previous = previous.previous
	}
	contracts.push(contract)
	return contracts
}

export const execute = ({ self: contract, expected, map, test }, value) => {
	const contracts = collectContracts(contract)

	// en fait il suffit lorsqu'on a une erreur de retourner ce qui merde
	// avec directement le subject description, actual et expected
	// qu'on lit parce qu'on sait quel contrat on vient d'éxécuter
	// il n'y a pas besoin d'avoir un objet qui soit le ixin des contrats

	contracts.forEach((contract) => {
		const validation = mixin(contract, () => {
			const actual = map(value)
			const valid = test(actual, expected)

			return {
				value,
				actual,
				valid,
			}
		})

		if (validation.valid === false) {
			// faudrais faire un truc pour arrêter la
			// et retourner ce qui merde
		}
	})
}

const contractTalent = ({ self: contract }) => {
	const expect = (nextContract) => {
		// nextContract peut être lui même une sous-chaine de contrat
		// qui devra alors s'appliquer sur la valeur du précédent
		// il faut donc une structure en arbre
		// mais j'avoue je sais pas comment faire
		return mixin(nextContract, () => ({ previous: contract }))
	}

	return { expect }
}

export const createContract = (props) => {
	return mixin(pure, () => props, contractTalent)
}

export const isContract = (value) => hasTalent(contractTalent, value)

const mustBe = (expected) => {
	return createContract({
		map: (value) => value,
		test: (actual, expected) => actual === expected,
		getExpectedDescription: () => `must be ${uneval(expected)}`,
	})
}

const mustHaveOwnProperty = (nameOrSymbol) => {
	return createContract({
		map: (value) => hasOwnProperty(value, nameOrSymbol),
		test: (actual) => actual === true,
		getSubjectDescription: () => `${nameOrSymbol} own property`,
		getExpectedDescription: () => `must be present`,
	})
}

const mustHavePropertyDescriptor = (nameOrSymbol) => {
	return createContract({
		nameOrSymbol,
		map: (value) => Object.getOwnPropertyDescriptor(value, nameOrSymbol),
		test: (actual) => typeof actual === "object",
		getSubjectDescription: () => `${nameOrSymbol} property descriptor`,
		getExpectedDescription: () => `must be an object`,
	})
}

const mustHaveOnlyKeys = (allowedKeys) => {
	return createContract({
		map: (value) => Object.keys(value),
		test: (actual) => actual.filter((key) => allowedKeys.includes(key) === false).length === 0,
		getSubjectDescription: () => `keys`,
		getExpectedDescription: () => `must have only these keys: ${allowedKeys}`,
	})
}

export const contract = createContract().expect(
	mustHavePropertyDescriptor("foo")
		.expect(mustHaveOwnProperty("writable").expect(mustBe(true)))
		.expect(mustHaveOwnProperty("value").expect())
		.expect(mustHaveOnlyKeys(["writable", "value", "configurable", "enumerable"])),
)
