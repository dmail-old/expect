import { isMatcher, createMatcher } from "../helper.js"
import { failed, all, any } from "@dmail/action"
import { matchAnyObject } from "../anyObject/anyObject.js"
import { matchAnyFunction } from "../anyFunction/anyFunction.js"
import { matchStrict } from "../strict/strict.js"
import { prefixValue } from "../constructedBy/constructedBy.js"
import { uneval } from "@dmail/uneval"

// if you want to prevent the recursion behaviour on an object/function
// you can specify a matcher for the value and it will just use the matcher
/*
{
	array: matchStrict(array)
}
*/

const defaultCreatePropertyValueMatcher = (propertyValue, recurse) => {
	if (propertyValue === null) {
		return matchStrict(propertyValue)
	}
	if (typeof propertyValue !== "object" && typeof propertyValue !== "function") {
		return matchStrict(propertyValue)
	}
	// beware it can recurse indefinitely if the object structure is circular
	// like function with .prototype.constructor cycling back on the function
	// it's currently hardfixed by listNames excluding some properties
	// but it must be more robust to support other kind of circular structure
	return () => recurse(propertyValue)
}

const compareProperties = (
	actual,
	expected,
	{
		allowExtra = false,
		extraMustBeEnumerable = true,
		createPropertyValueMatcher = defaultCreatePropertyValueMatcher,
	},
) => {
	if (actual === null || actual === undefined) {
		return failed(`cannot compare properties of ${actual}: it has no properties`)
	}

	return any([matchAnyObject()(actual), matchAnyFunction()(actual)]).then(
		() => {
			const listNames = value => {
				const names = Object.getOwnPropertyNames(value)
				if (typeof value === "function") {
					return names.filter(
						name =>
							name !== "length" &&
							name !== "name" &&
							name !== "arguments" &&
							name !== "caller" &&
							name !== "prototype",
					)
				}
				return names
			}

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)
			const propertyExpectations = []

			const recurse = propertyValue => {
				return compareProperties(propertyValue, {
					allowExtra,
					extraMustBeEnumerable,
					createPropertyValueMatcher,
				})
			}

			expectedPropertyNames.forEach(name => {
				if (actualPropertyNames.includes(name)) {
					const expectedPropertyValue = expected[name]
					let propertyMatcher
					if (isMatcher(expectedPropertyValue)) {
						propertyMatcher = expectedPropertyValue
					} else {
						propertyMatcher = createPropertyValueMatcher(expectedPropertyValue, recurse)
					}
					propertyExpectations.push(
						propertyMatcher()(actual[name]).then(
							null,
							message => `${name} property mismatch: ${message}`,
						),
					)
				} else {
					propertyExpectations.push(failed(`missing ${name} property`))
				}
			})

			if (allowExtra === false) {
				actualPropertyNames.forEach(name => {
					if (expectedPropertyNames.includes(name) === false) {
						if (
							extraMustBeEnumerable === false ||
							Object.getOwnPropertyDescriptor(actual, name).enumerable === true
						) {
							propertyExpectations.push(failed(`unexpected ${name} property`))
						}
					}
				})
			}

			return all(propertyExpectations)
		},
		() =>
			failed(
				`expect a function or an object to compare properties but got ${prefixValue(
					actual,
				)}: ${uneval(actual)}`,
			),
	)
}

export const matchHavingProperties = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: false }))

export const matchHavingPropertiesAllowingExtra = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: true }))

export const matchHavingPropertiesIncludingHidden = expected =>
	createMatcher(actual => compareProperties(actual, expected, { extraMustBeEnumerable: false }))
