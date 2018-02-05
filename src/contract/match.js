// https://github.com/cemerick/jsdifflib

import { getOwnPropertyNamesAndSymbols, hasOwnProperty } from "../helper.js"
import { contractTalent } from "../contract/contract.js"
import { mixin, pure, hasTalent } from "@dmail/mixin"
import { failed, passed } from "@dmail/action"
import { uneval } from "@dmail/uneval"

const createContract = (...talents) => mixin(pure, contractTalent, ...talents)

const equalsTalent = () => {}
const createEqualsContract = (expected) => {
	return createContract(() => ({ expected }), equalsTalent)
}

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

const constructorTalent = () => {
	const map = (value) => getConstructorNameFromValue(value)

	return { map }
}
const createConstructorContract = (expected) => {
	return createContract(
		() => ({ expected: getConstructorNameFromValue(expected) }),
		constructorTalent,
	)
}

const hasOwnPropertyTalent = ({ expected }) => {
	const validate = ({ actual }) => {
		return hasOwnProperty(actual, expected) ? passed() : failed()
	}

	return { validate }
}
const createHasOwnPropertyContract = (nameOrSymbol) => {
	return createContract(() => ({ expected: nameOrSymbol }), hasOwnPropertyTalent)
}

const referenceTalent = ({ expected }) => {
	const readReference = (contract) => {
		let previous = contract.previous
		let index = 0
		while (index < expected.length) {
			previous = previous.previous
			index++
		}
		return previous.actual
	}

	const map = (value, contract) => readReference(contract)

	return { map }
}
const createReferenceContract = (reference) => {
	return createContract(() => ({ expected: reference }), referenceTalent)
}

const noOtherPropertiesThanTalent = ({ expected }) => {
	const map = (value) => {
		return getOwnPropertyNamesAndSymbols(value).filter(
			(nameOrSymbol) => expected.includes(nameOrSymbol) === false,
		)
	}
	const validate = ({ actual: extraPropertyNamesOrSymbols }) => {
		return extraPropertyNamesOrSymbols.length === 0 ? passed() : failed()
	}

	return { map, validate }
}
const createNoOtherPropertiesThanContract = (namesAndSymbols) => {
	return createContract(() => ({ expected: namesAndSymbols }), noOtherPropertiesThanTalent)
}

const descriptorAttributeTalent = ({ nameOrSymbol, attribute }) => {
	const map = (value) => Object.getOwnPropertyDescriptor(value, nameOrSymbol)[attribute]

	return { map }
}

const toStringOutputEqualsTalent = () => {
	const map = (value) => value.toString()

	return map
}
const createToStringOutputEqualsContract = (expected) => {
	return createContract(() => ({ expected }), toStringOutputEqualsTalent)
}

const valueOfOutputEqualsTalent = () => {
	const map = (value) => {
		return value.valueOf()
	}

	return { map }
}
const createValueOfOutputEqualsContract = (expected) => {
	return createContract(() => ({ expected }), valueOfOutputEqualsTalent)
}

const isPrimitive = (value) => {
	if (value === null) {
		return true
	}
	if (value === undefined) {
		return true
	}
	const type = typeof value
	if (type === "string" || type === "number" || type === "boolean" || type === "symbol") {
		return true
	}
	return false
}

export const createMatchContract = (expected) => {
	if (isPrimitive(expected)) {
		return createEqualsContract(expected)
	}

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

	const createDescriptorContract = (nameOrSymbol, descriptor) => {
		const expectedAttributes = Object.keys(descriptor)
		return expectedAttributes.reduce((contract, attribute) => {
			const expected = descriptor[attribute]
			if (isPrimitive(expected) === false) {
				const reference = getReference(contract, expected)
				if (reference) {
					return contract.expect(createReferenceContract(reference))
				}
			}
			return contract.expect(
				mixin(
					createMatchContract(expected),
					() => ({ nameOrSymbol, attribute }),
					descriptorAttributeTalent,
				),
			)
		}, createHasOwnPropertyContract(nameOrSymbol))
	}

	let contract = createConstructorContract(expected)
	const expectedPropertyNamesAndSymbols = getOwnPropertyNamesAndSymbols(expected)
	const expectedConstructorName = contract.expected

	if (expectedConstructorName === "RegExp") {
		contract = contract.expect(createToStringOutputEqualsContract(expected.toString()))
	} else if ("valueOf" in expected) {
		// Object.create(null) has no valueOf
		// handle String, Boolean, Number, Date, Symbol
		const valueOfOutput = expected.valueOf()
		if (isPrimitive(valueOfOutput)) {
			contract = contract.expect(createValueOfOutputEqualsContract(valueOfOutput))
		}
	}
	// Set, Map, WeakMap, WeakSet entries should be compared

	return expectedPropertyNamesAndSymbols
		.reduce(
			(contract, nameOrSymbol) =>
				contract.expect(
					createDescriptorContract(
						nameOrSymbol,
						Object.getOwnPropertyDescriptor(expected, nameOrSymbol),
					),
				),
			contract,
		)
		.expect(createNoOtherPropertiesThanContract(expectedPropertyNamesAndSymbols))
}

const getSubjectDescription = (execution) => {
	const getValueDescription = (execution) => {
		if (hasTalent(constructorTalent, execution)) {
			return `constructor`
		}
		if (hasTalent(hasOwnPropertyTalent, execution)) {
			return `${execution.expected} property`
		}
		if (hasTalent(descriptorAttributeTalent, execution)) {
			return `${execution.nameOrSymbol} property ${execution.attribute}`
		}
		if (hasTalent(valueOfOutputEqualsTalent, execution)) {
			return `valueOf() return value`
		}
		if (hasTalent(toStringOutputEqualsTalent, execution)) {
			return `toString() return value`
		}
		return `value`
	}

	let description = getValueDescription(execution)
	let previous = execution.previous
	let current = execution
	while (previous) {
		// some contract are chained but they are executed on the same value
		if (
			hasTalent(constructorTalent, previous) === false &&
			hasTalent(hasOwnPropertyTalent, previous) === false &&
			(hasTalent(descriptorAttributeTalent, previous) &&
				hasTalent(descriptorAttributeTalent, current)) === false
		) {
			description = `${getValueDescription(previous)} ${description}`
		}
		current = previous
		previous = previous.previous
	}
	return description
}

const getReferenceDescription = (reference) => {
	return reference
		.reverse()
		.slice(0, -1)
		.map((contract) => String(getSubjectDescription(contract)))
		.join(" ")
}

const getActualDescription = (execution) => {
	if (hasTalent(hasOwnPropertyTalent, execution)) {
		return `missing`
	}
	return `${uneval(execution.actual)}`
}

const getExpectedDescription = (execution) => {
	if (hasTalent(referenceTalent, execution)) {
		return `a pointer to ${getReferenceDescription(execution.expected)}`
	}
	if (hasTalent(hasOwnPropertyTalent, execution)) {
		return `exists`
	}
	if (hasTalent(noOtherPropertiesThanTalent, execution)) {
		if (execution.expected.length === 0) {
			return `no own properties`
		}
		return `no other owner properties than ${execution.expected}`
	}
	return uneval(execution.expected)
}

export const createFailureMessage = (execution) => {
	return `mismatch on:
${getSubjectDescription(execution)}

actual:
${getActualDescription(execution)}

expected:
${getExpectedDescription(execution)}`
}
