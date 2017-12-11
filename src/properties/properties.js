import { sequence, passed, failed } from "@dmail/action"
import { isAssertion, createMatcherFromFunction } from "../matcher.js"
import { is } from "../is/is.js"
import { canHaveOwnProperty, getOwnPropertyNamesAndSymbols, hasProperty } from "../helper.js"
import { createAnonymousTrace, getPointerFromTrace, comparePointer } from "../trace/trace.js"
import { prefixValue } from "../constructedBy/constructedBy.js"

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
		return `${getValueNameFromTrace(expectedTrace)} mismatch: ${message}`
	},
	"missing-pointer": ({ expectedTrace, expectedPointer, actual }) => {
		return `expect ${getValueNameFromTrace(expectedTrace)} to be a pointer to ${getPointerName(
			expectedPointer,
		)} but got ${prefixValue(actual)}`
	},
	"unexpected-pointer": ({ expectedTrace, expected, actualPointer }) => {
		return `expect ${getValueNameFromTrace(expectedTrace)} to be ${prefixValue(
			expected,
		)} but got a pointer to ${getPointerName(actualPointer)}`
	},
	"pointer-mismatch": ({ expectedTrace, expectedPointer, actualPointer }) => {
		return `expect ${getValueNameFromTrace(expectedTrace)} to be a pointer to ${getPointerName(
			expectedPointer,
		)} but got a pointer to ${getPointerName(actualPointer)}`
	},
	"unexpected-property": ({ expectedTrace, name }) => {
		return `unexpected property ${name} on ${getValueNameFromTrace(expectedTrace)}`
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

			const expectedCanHaveOwnProperty = canHaveOwnProperty(expected)
			const actualCanHaveOwnProperty = canHaveOwnProperty(actual)

			if (
				expectedCanHaveOwnProperty !== actualCanHaveOwnProperty ||
				expectedCanHaveOwnProperty === false
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
			const actualExtraPropertyNameOrSymbol = getOwnPropertyNamesAndSymbols(actualOwner).find(
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
			if (actualExtraPropertyNameOrSymbol) {
				return failed({
					type: "unexpected-property",
					expectedTrace: expectedOwnerTrace,
					name: actualExtraPropertyNameOrSymbol,
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
