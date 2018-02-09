// https://github.com/cemerick/jsdifflib

import { getOwnPropertyNamesAndSymbols, isPrimitive, hasOwnProperty } from "../helper.js"
import { mixin, hasTalent } from "@dmail/mixin"
import { uneval } from "@dmail/uneval"
import { failed, passed } from "@dmail/action"

/*
Il reste 2 gros problèmes:

problème 1:
mustMatch doit pouvoir être récursif, puisque lorsqu'on lit une propriété
on va rapeller la logique de mustMatch sur cette propriété
et comme mustMatch retourne un contrat c'est pas bon pour le moment
ce qu'on veut c'est lire la valeur de la propriété mais la valider en utilisant
la logique dans mustMatch par exemple en vérifiant qu'elle === true

problème 2:
lorsque mustMatch est rapellé ou même lorqu'on itère sur les propriété il
faut avoir connaissance des valeurs précédentes pour détecter les structures circulaires

à vue de nez je dirais qu'il faut séparer la logique permettant de lire la valeur
qu'on souhaite tester de la logique permettant de la tester

en gros on construit au fur et à mesure un objet de plus en plus complexe qui
décrit une série de chose qu'on va faire par la suite
une sorte de préenregistrement qu'on va tenter de jouer par la suite

ce que ça m'évoquer quand je regarde mapActual, mapExpected
c'est qu'en fait il faut créer une sorte de contrat qui est rempli
pour expected et ensuite on prend de contrat comme example et on l'applique
sur une autre valeur

donc au final un contrat se compose d'une manière de lire actual test(value)
puis d'une manière de vérifier si ça match expected

const check = (result, unwrapContract = true) => {
	const { actual, expected } = result

	if (unwrapContract && typeof expected === 'function') {
		return expected(result.actual, result)
	}

	if (actual === expected) {
		return passed(result)
	}

	return failed(result)
}

const mustBe = (expected) => (value, previous) => {
	const actual = value
	const result = { previous, type: 'mustBe', expected, value, actual }
	return check(result, false)
}

const propertyPresence = (nameOrSymbol, expected) => (value, previous) => {
	const actual = hasOwnProperty(value, nameOrSymbol)
	const result = { previous, type: 'propertyPresence', expected, nameOrSymbol, value, actual }
	return check(result)
}

const propertyDescriptorAttribute = (nameOrSymbol, attribute, expected) => (value, previous) => {
	const actual = Object.getOwnPropertyDescriptor(value, nameOrSymbol)[attribute]
	const result = { previous, type: 'propertyDescriptor', expected, nameOrSymbol, attribute, value, actual }
	return check(result)
}

const allContract = (firstContract, ...remainingContracts) => (value, previous) => {
	return reduce(
		remainingContracts,
		(result, contract) => contract(previous.actual, previous),
		firstContract(value, previous)
	)
}

const propertyFooMustBePresent = mustBe(true)
const hasOwnPropertyFoo = propertyPresence('foo', true)
const propertyFooWritableContract = propertyDescriptorAttribute(
	'foo',
	'writable',
	mustBe(false)
)
const propertyFooValueContract = propertyDescriptorAttribute(
	'foo',
	'value',
	mustBe(true)
)

// ça peut surement fonctionner
// au final j'obtiens un truc qui fait ce que je veux:
// je peux savoir ce que je suis en train de tester
// pour la gestion du récursif j'aurais juste à créer un contrat capable de lire
// dans les previous lorsqu'on l'éxécute
-> voilà le souci actuellement on apelle sur (value) donc on perd le contexte
-> il faudrais conserver l'historique lorsqu'on les chain
c'est ptet possible grâce au second argument dans allContract
mais je pense pas parce que ensuite on récup le result qui lui ne tiendra
pas compte du contexte, il faudrais que result propagate toujours le second argument
pour connaitre le previous result, ok on peut tester avec ça

allContract(
	hasOwnPropertyFoo,
	propertyFooWritableContract,
	propertyFooValueContract,
)({ foo: true })

*/

const whenReadingActualItSelf = () => {
	const mapActual = (value) => value

	return { mapActual }
}

const whenReadingOwnPropertyPresence = () => {
	const mapActual = (value, { nameOrSymbol }) => hasOwnProperty(value, nameOrSymbol)

	return { mapActual }
}

const whenReadingConstructor = () => {
	const getConstructorName = (constructor) => {
		const { name } = constructor
		return name
	}

	const getConstructorNameFromValue = (value) => {
		if (value === null) {
			return "null"
		}
		if (value === undefined) {
			return "undefined"
		}
		// handle Object.create(null)
		if (typeof value === "object" && "constructor" in value === false) {
			return "Object"
		}
		const name = getConstructorName(value.constructor)
		if (name === "") {
			if (typeof value === "object") {
				return "Object"
			}
			if (typeof value === "function") {
				return "Function"
			}
			return "Anonymous"
		}
		return name
	}

	const mapExpected = (value) => getConstructorNameFromValue(value)

	const mapActual = (value) => getConstructorNameFromValue(value)

	return {
		mapExpected,
		mapActual,
	}
}

const whenReadingPropertyDescriptorAttribute = () => {
	const mapActual = (value, { nameOrSymbol, attribute }) =>
		Object.getOwnPropertyDescriptor(value, nameOrSymbol)[attribute]

	return { mapActual }
}

const whenReadingToStringOutput = () => {
	const mapExpected = (value) => value.toString()

	const mapActual = (value) => value.toString()

	return { mapExpected, mapActual }
}

const whenReadingValueOfOutput = () => {
	const mapExpected = (value) => value.valueOf()

	const mapActual = (value) => value.valueOf()

	return { mapExpected, mapActual }
}

const whenReadingReference = () => {
	const readReference = (reference, contract) => {
		let previous = contract.previous
		let index = 0
		while (index < reference.length) {
			previous = previous.previous
			index++
		}
		return previous.actual
	}

	const mapActual = (value, { reference, self: contract }) => readReference(reference, contract)

	return { mapActual }
}

const whenReadingOwnProperties = () => {
	const mapActual = (value) => getOwnPropertyNamesAndSymbols(value)

	return { mapActual }
}

const mustBe = () => {
	const validate = ({ actual, expected }) => {
		return actual === expected ? passed() : failed()
	}

	return { validate }
}

const mustBeTrue = () => {
	const validate = ({ actual }) => {
		return actual === true ? passed() : failed()
	}

	return { validate }
}

const mustHaveOnlyAllowedOwnProperties = () => {
	const validate = ({ actual, allowedOwnProperties }) => {
		const extraOwnProperties = actual.filter(
			(nameOrSymbol) => allowedOwnProperties.includes(nameOrSymbol) === false,
		)
		return extraOwnProperties.length === 0 ? passed() : failed({ extraOwnProperties })
	}

	return { validate }
}

const pureContract = () => {
	const nextContracts = []

	const expect = (contract) => {
		nextContracts.push(contract)
		return this
	}

	return { nextContracts, expect }
}

const mustMatch = ({ expectedValue, self: contract }) => {
	if (isPrimitive(expectedValue)) {
		return contract.expect(mixin(contract, whenReadingActualItSelf, mustBe))
	}

	contract = contract.expect(mixin(contract, whenReadingConstructor, mustBe))
	const expectedConstructorName = contract.expected

	if (expectedConstructorName === "RegExp") {
		contract = contract.expect(mixin(contract, whenReadingToStringOutput, mustBe))
	} else if (
		expectedConstructorName === "String" ||
		expectedConstructorName === "Boolean" ||
		expectedConstructorName === "Number" ||
		expectedConstructorName === "Date" ||
		expectedConstructorName === "Symbol"
	) {
		contract = contract.expect(mixin(contract, whenReadingValueOfOutput, mustBe))
	}
	// Set, Map, WeakMap, WeakSet entries should be compared

	// ISSUE #2
	const getReference = (contract, value) => {
		const contracts = []
		let previousContract = contract.parent
		while (previousContract) {
			contracts.push(previousContract)
			if (previousContract.expected === value) {
				return contracts
			}
			previousContract = previousContract.parent
		}
		return null
	}

	const createDescriptorContract = (nameOrSymbol, expectedValue) => {
		const descriptor = Object.getOwnPropertyDescriptor(expectedValue, nameOrSymbol)

		const hasOwnPropertyContract = mixin(
			pureContract,
			() => ({ expectedValue, nameOrSymbol }),
			whenReadingOwnPropertyPresence,
			mustBeTrue,
		)
		const expectedAttributes = Object.keys(descriptor)

		return expectedAttributes.reduce((contract, attribute) => {
			const descriptorAttributeExpectedValue = descriptor[attribute]
			if (isPrimitive(descriptorAttributeExpectedValue) === false) {
				const reference = getReference(contract, descriptorAttributeExpectedValue)
				if (reference) {
					return contract.expect(
						mixin(
							pureContract,
							() => ({ expectedValue: descriptorAttributeExpectedValue, reference }),
							whenReadingReference,
							mustBe,
						),
					)
				}
			}

			return contract.expect(
				mixin(
					pureContract,
					() => ({ expectedValue: descriptorAttributeExpectedValue, nameOrSymbol, attribute }),
					whenReadingPropertyDescriptorAttribute,
					// ISSUE #1
					mustMatch,
				),
			)
		}, hasOwnPropertyContract)
	}

	const expectedPropertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(expectedValue)

	return expectedPropertyNamesAndSymbols
		.reduce(
			(contract, nameOrSymbol) =>
				contract.expect(createDescriptorContract(nameOrSymbol, expectedValue)),
			contract,
		)
		.expect(
			mixin(
				pureContract,
				() => ({ expectedValue, allowedOwnProperties: expectedPropertyNamesAndSymbols }),
				whenReadingOwnProperties,
				mustHaveOnlyAllowedOwnProperties,
			),
		)
}

export const match = (expectedValue) => {
	return mustMatch(mixin(pureContract, () => ({ expectedValue })))
}

export const execute = (contract, value) => {
	const execution = mixin(self, () => ({ value, ...contract.setup(value, self) }))

	return contract.validate(execution).then(
		(passProps = {}) => {
			let lastExecution = mixin(execution, () => passProps)
			let index = 0

			const iterate = () => {
				if (index === contract.nextContracts.length) {
					return lastExecution
				}
				const nextContract = contract.nextContracts[index]
				index++
				const chainedContract = mixin(nextContract, () => ({ previous: lastExecution }))
				return execute(chainedContract, value).then((execution) => {
					lastExecution = execution
					return iterate()
				})
			}

			return iterate()
		},
		(failProps = {}) => mixin(execution, () => failProps),
	)
}

const getSubjectDescription = (execution) => {
	const getReferenceDescription = (reference) => {
		return reference
			.reverse()
			.slice(0, -1)
			.map((contract) => String(getSubjectDescription(contract)))
			.join(" ")
	}

	const getValueDescription = (execution) => {
		if (hasTalent(whenReadingConstructor, execution)) {
			return `constructor`
		}
		if (hasTalent(whenReadingOwnPropertyPresence, execution)) {
			return `${execution.expected} own property presence`
		}
		if (hasTalent(whenReadingPropertyDescriptorAttribute, execution)) {
			return `${execution.nameOrSymbol} property ${execution.attribute}`
		}
		if (hasTalent(whenReadingValueOfOutput, execution)) {
			return `valueOf() return value`
		}
		if (hasTalent(whenReadingToStringOutput, execution)) {
			return `toString() return value`
		}
		if (hasTalent(whenReadingReference, execution)) {
			return `value at ${getReferenceDescription(execution.reference)}`
		}
		return `value`
	}

	let description = getValueDescription(execution)
	let previous = execution.previous
	let current = execution
	while (previous) {
		// some contract are chained but they are executed on the same value
		if (
			hasTalent(whenReadingConstructor, previous) === false &&
			hasTalent(whenReadingOwnPropertyPresence, previous) === false &&
			(hasTalent(whenReadingPropertyDescriptorAttribute, previous) &&
				hasTalent(whenReadingPropertyDescriptorAttribute, current)) === false
		) {
			description = `${getValueDescription(previous)} ${description}`
		}
		current = previous
		previous = previous.previous
	}
	return description
}

const getExpectedDescription = (execution) => {
	if (hasTalent(mustBe)) {
		return `must be ${uneval(execution.expected)}`
	}
	if (hasTalent(mustBeTrue, execution)) {
		return `must be true`
	}
	if (hasTalent(mustHaveOnlyAllowedOwnProperties, execution)) {
		if (execution.allowedOwnProperties.length === 0) {
			return `no own properties`
		}
		return `only these own properties: ${execution.allowedOwnProperties}`
	}
	return uneval(execution.expected)
}

const getActualDescription = (execution) => {
	if (hasTalent(mustHaveOnlyAllowedOwnProperties, execution)) {
		return `${execution.extraOwnProperties.length} extra properties: ${
			execution.extraOwnProperties
		}`
	}
	return `${uneval(execution.actual)}`
}

const createFailureMessage = (execution) => {
	return `mismatch on:
${getSubjectDescription(execution)}

actual:
${getActualDescription(execution)}

expected:
${getExpectedDescription(execution)}`
}

export { createFailureMessage }
