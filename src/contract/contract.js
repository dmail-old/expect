import { mapDepthFirst } from "./tree.js"
import { uneval } from "@dmail/uneval"

const execute = ({ expected, map, test }, value) => {
	const actual = map(value)
	const valid = test(actual, expected)
	const validation = {
		value,
		actual,
		valid,
	}
	return validation
}

export const executeContractTree = (rootNode, value) => {
	return mapDepthFirst(rootNode, ({ node, next, stop, mappedParent: parentValidation }) => {
		const validation = execute(node.contract, parentValidation ? parentValidation.actual : value)

		if (validation.valid === false) {
			return stop(validation)
		}
		return next(validation)
	})
}

const mustBe = (expected) => {
	return {
		map: (value) => value,
		test: (actual, expected) => actual === expected,
		getExpectedDescription: () => `must be ${uneval(expected)}`,
	}
}

const mustHaveOwnProperty = (nameOrSymbol) => {
	return {
		map: (value) => hasOwnProperty(value, nameOrSymbol),
		test: (actual) => actual === true,
		getSubjectDescription: () => `${nameOrSymbol} own property`,
		getExpectedDescription: () => `must be present`,
	}
}

const mustHaveOwnPropertyDescriptor = (nameOrSymbol) => {
	return {
		map: (value) => Object.getOwnPropertyDescriptor(value, nameOrSymbol),
		test: (actual) => typeof actual === "object",
		getSubjectDescription: () => `${nameOrSymbol} property descriptor`,
		getExpectedDescription: () => `must be an object`,
	}
}

const mustHaveOnlyOwnPropertyNames = (allowedPropertyNames) => {
	return {
		map: (value) => Object.getOwnPropertyNames(value),
		test: (actual) =>
			actual.filter((name) => allowedPropertyNames.includes(name) === false).length === 0,
		getSubjectDescription: () => `own property names`,
		getExpectedDescription: () =>
			`must have only these own property names: ${allowedPropertyNames}`,
	}
}

// const mustHaveOnlyOwnSymbols = (allowedSymbols) => {}

// const mustBeConstructedBy = () => {}
// mustBeConstructedBy(Object) // it must fail on Object.create(null)
// dailleurs mustBeConstructedBy c'est juste
// un truc qui dit qu'on doit avoir une propriété constructor.name === 'Object'
// on utilisera donc le plus strict des moyens de check
// pour object on testera typeof si Object.create(null)
// sinon .constructor.name === 'Object'

const contractTree = {
	children: [
		{ data: mustHaveOwnPropertyDescriptor("foo") },
		{
			data: mustHaveOwnProperty("writable"),
			children: [mustBe(true)],
		},
		{ data: mustHaveOwnProperty("value") },
		{
			data: mustHaveOnlyOwnPropertyNames(["writable", "value", "configurable", "enumerable"]),
		},
	],
}

executeContractTree(contractTree)
