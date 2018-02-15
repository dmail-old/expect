import { sequence, passed, failed } from "@dmail/action"
import { createMatcherFromFunction } from "../matcher.js"
import { is } from "../is/is.js"
import { getOwnPropertyNamesAndSymbols, canSetOwnProperty } from "../helper.js"
import { createAnonymousTrace, getPointerFromTrace, comparePointer } from "../trace/trace.js"
import { uneval } from "@dmail/uneval"
import { createFactory } from "@dmail/mixin"
import { pureContract, isContract } from "../contract.js"
import { hasProperty } from "./hasProperty.js"

const getValueNameFromTrace = ({ getName, getParentTrace }) => {
	const name = getName()
	const parentTrace = getParentTrace()
	if (parentTrace === null) {
		return name
	}
	// we do String(valueName) in case valueName is a symbol
	// to avoid Cannot convert a Symbol value to a string error
	return `${getValueNameFromTrace(parentTrace)} ${String(name)}`
}

const getPointerName = (pointer) => {
	return pointer
		.reverse()
		.slice(0, -1)
		.map((trace) => String(trace.getName()))
		.join(" ")
}

const failureMessageCreators = {
	mismatch: ({ expectedTrace, message }) => {
		return `unexpected ${getValueNameFromTrace(expectedTrace)}:
${message}`
	},
	"missing-pointer": ({ expectedTrace, expectedPointer, actual }) => {
		return `unexpected ${getValueNameFromTrace(expectedTrace)}:
actual is:
${uneval(actual)}

when expecting:
a pointer to ${getPointerName(expectedPointer)}
`
	},
	"unexpected-pointer": ({ expectedTrace, expected, actualPointer }) => {
		return `unexpected ${getValueNameFromTrace(expectedTrace)}:
actual is:
a pointer to ${getPointerName(actualPointer)}

when expecting:
${uneval(expected)}
`
	},
	"pointer-mismatch": ({ expectedTrace, expectedPointer, actualPointer }) => {
		return `unexpected ${getValueNameFromTrace(expectedTrace)}:
actual is:
a pointer to ${getPointerName(expectedPointer)}

when expecting:
a pointer to ${getPointerName(actualPointer)}
`
	},
	"unexpected-properties": ({ expectedTrace, properties, actual }) => {
		const propertiesMessages = properties.map((property) => {
			return `
${property}:
${uneval(actual[property])}
`
		})

		return `${properties.length} unexpected property on ${getValueNameFromTrace(expectedTrace)}:
${propertiesMessages.join("")}
`
	},
}

const propertyIsEnumerable = (object, name) => {
	return Object.prototype.propertyIsEnumerable.call(object, name)
}

const hasPointerContract = createFactory(pureContract, ({ setValidator }) => {
	const getActualDescription = ({ actual }) => {
		return actual ? `a pointer to ${getPointerName(actual)}` : uneval(actual)
	}

	const getExpectedDescription = ({ expected }) => `a pointer to ${getPointerName(expected)}`

	setValidator(({ actual }) => {
		return actual !== null
	})

	return { getActualDescription, getExpectedDescription }
})

const noPointerContract = createFactory(pureContract, ({ setValidator }) => {
	setValidator(({ actual }) => {
		return actual === null
	})
})

const pointerContract = createFactory(pureContract, ({ setValidator }) => {
	setValidator(({ actual, expected }) => {
		return comparePointer(expected, actual)
	})
})

const compareProperties = ({ allowExtra, extraMustBeEnumerable }) => {
	const createPropertiesMatcher = ({
		actualTrace: actualOwnerTrace,
		expectedTrace: expectedOwnerTrace,
	}) => {
		const expectedOwner = expectedOwnerTrace.getValue()
		const actualOwner = actualOwnerTrace.getValue()

		return sequence(getOwnPropertyNamesAndSymbols(expectedOwner), (name) => {
			const expectedTrace = expectedOwnerTrace.discoverProperty(name)
			const actualTrace = actualOwnerTrace.discoverProperty(name)

			return hasProperty
				.sign(name)
				.validate(actualOwner)
				.then(() => {
					const actual = actualTrace.getValue()
					const expected = expectedTrace.getValue()

					if (isContract(expected)) {
						return expected.validate(actual)
					}

					const expectedCanSetOwnProperty = canSetOwnProperty(expected)
					const actualCanSetOwnProperty = canSetOwnProperty(actual)

					if (
						expectedCanSetOwnProperty !== actualCanSetOwnProperty ||
						expectedCanSetOwnProperty === false
					) {
						return is.sign(expected).validate(actual)
					}

					const expectedPointer = getPointerFromTrace(expectedTrace, expected)
					const actualPointer = getPointerFromTrace(actualTrace, actual)

					if (expectedPointer === null) {
						return noPointerContract
							.sign()
							.validate(actualPointer)
							.then(() => {
								return createPropertiesMatcher({
									expectedTrace,
									actualTrace,
								})
							})
					}

					return hasPointerContract
						.sign()
						.validate(actualPointer)
						.then(() => {
							return pointerContract.sign(expectedPointer).validate(actualPointer)
						})
						.then(() => {
							return createPropertiesMatcher({
								expectedTrace,
								actualTrace,
							})
						})
				})
		}).then(() => {
			if (allowExtra) {
				return passed()
			}
			const extraPropertyNameOrSymbols = getOwnPropertyNamesAndSymbols(actualOwner).filter(
				(name) => {
					if (hasProperty(expectedOwner, name)) {
						return false
					}
					if (extraMustBeEnumerable && propertyIsEnumerable(actualOwner, name) === false) {
						return false
					}
					return true
				},
			)
			if (extraPropertyNameOrSymbols.length) {
				return failed({
					type: "unexpected-properties",
					expectedTrace: expectedOwnerTrace,
					actual: actualOwner,
					properties: extraPropertyNameOrSymbols,
				})
			}
			return passed()
		})
	}

	return ({ actual, expected }) => {
		return createPropertiesMatcher({
			actualTrace: createAnonymousTrace(actual),
			expectedTrace: createAnonymousTrace(expected),
		}).then(() => undefined, (failure) => failureMessageCreators[failure.type](failure))
	}
}

export const exactProperties = createMatcherFromFunction(
	compareProperties({
		allowExtra: false,
		extraMustBeEnumerable: true,
	}),
)

export const theseProperties = createMatcherFromFunction(
	compareProperties({
		allowExtra: true,
		extraMustBeEnumerable: true,
	}),
)

// add propertiesMatchingIncludingHidden
// add strictPropertiesMatchingIncludingHidden
