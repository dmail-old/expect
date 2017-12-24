import { sequence, passed, failed } from "@dmail/action"
import { isAssertion, createMatcherFromFunction } from "../matcher.js"
import { is } from "../is/is.js"
import { getOwnPropertyNamesAndSymbols, hasProperty, canSetOwnProperty } from "../helper.js"
import { createAnonymousTrace, getPointerFromTrace, comparePointer } from "../trace/trace.js"
import { uneval } from "@dmail/uneval"

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
	"missing-property": ({ expectedTrace }) => {
		return `missing property ${expectedTrace.getName()} on ${getValueNameFromTrace(
			expectedTrace.getParentTrace(),
		)}`
	},
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

			if (hasProperty(actualOwner, name) === false) {
				return failed({
					type: "missing-property",
					expectedTrace,
				})
			}

			const actual = actualTrace.getValue()
			const expected = expectedTrace.getValue()

			if (isAssertion(expected)) {
				return expected(actual).then(null, (message) =>
					failed({
						type: "mismatch",
						expectedTrace,
						message,
					}),
				)
			}

			const expectedCanSetOwnProperty = canSetOwnProperty(expected)
			const actualCanSetOwnProperty = canSetOwnProperty(actual)

			if (
				expectedCanSetOwnProperty !== actualCanSetOwnProperty ||
				expectedCanSetOwnProperty === false
			) {
				return is(expected)(actual).then(null, (message) =>
					failed({
						type: "mismatch",
						expectedTrace,
						message,
					}),
				)
			}

			const expectedPointer = getPointerFromTrace(expectedTrace, expected)
			const actualPointer = getPointerFromTrace(actualTrace, actual)

			if (expectedPointer && actualPointer === null) {
				return failed({
					type: "missing-pointer",
					expectedTrace,
					expectedPointer,
					actual,
				})
			}

			if (actualPointer && expectedPointer === null) {
				return failed({
					type: "unexpected-pointer",
					expectedTrace,
					expected,
					actualPointer,
				})
			}

			if (expectedPointer && actualPointer) {
				if (comparePointer(expectedPointer, actualPointer) === false) {
					return failed({
						type: "pointer-mismatch",
						expectedTrace,
						expectedPointer,
						actualPointer,
					})
				}
				return passed()
			}

			return createPropertiesMatcher({
				expectedTrace,
				actualTrace,
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
