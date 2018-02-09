import { mixin, pure, hasTalent, hasTalentOf } from "@dmail/mixin"
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

const execute = ({ self: contract, map, expected }, value) => {
	const contracts = collectContracts(contract)

	// en fait il suffit lorsqu'on a une erreur de retourner ce qui merde
	// avec directement le subject description, actual et expected
	// qu'on lit parce qu'on sait quel contrat on vient d'éxécuter
	// il n'y a pas besoin d'avoir un objet qui soit le ixin des contrats

	contracts.forEach((contract) => {
		let validation

		if (hasTalentOf(contract, expected)) {
			// j'ai besoin de la previous validation et pas du previous contract
			validation = execute(expected, contract.previous ? contract.previous.actual : value)
		} else {
			validation = mixin(contract, () => {
				// si y'a un contrat précédent
				// faudrais récup du précédent je dirais
				const actual = map(value)
				const valid = actual === expected

				return {
					value,
					actual,
					valid,
				}
			})
		}

		if (validation.valid === false) {
			// faudrais faire un truc pour arrêter la
			// et retourner ce qui merde
		}
	})
}

const contractTalent = ({ self: contract }) => {
	// if (hasTalentOf(contract, expected)) {
	// 	return mixin(expected, () => ({ previous: contract }))
	// }

	const chain = (nextContract) => {
		return mixin(nextContract, () => ({ previous: contract }))
	}

	return { chain }
}

export const createContract = ({ expected, map = (value) => value, ...remainingProps }) => {
	return mixin(pure, () => ({ expected, map, ...remainingProps }), contractTalent)
}

export const isContract = (value) => hasTalent(contractTalent, value)

export const mustBe = (expected) =>
	createContract({
		expected,
	})

const propertyPresence = (nameOrSymbol, expected) =>
	createContract({
		expected,
		nameOrSymbol,
		map: (value) => hasOwnProperty(value, nameOrSymbol),
	})

export const mustHaveOwnProperty = (nameOrSymbol) => propertyPresence(nameOrSymbol, true)

export const propertyDescriptorAttribute = (nameOrSymbol, attribute, expected) =>
	createContract({
		expected,
		nameOrSymbol,
		attribute,
		map: (value) => Object.getOwnPropertyDescriptor(value, nameOrSymbol)[attribute],
	})

const mustHaveFooOwnProperty = mustHaveOwnProperty("foo")
const fooOwnPropertyMustBeWritable = propertyDescriptorAttribute("foo", "writable", true)
const fooOwnPropertyValueMustHaveBarOwnProperty = propertyDescriptorAttribute(
	"foo",
	"value",
	mustHaveOwnProperty("bar"),
)

const contract = mustHaveFooOwnProperty
	.chain(fooOwnPropertyMustBeWritable)
	.chain(fooOwnPropertyValueMustHaveBarOwnProperty)

execute(contract, { foo: true })
