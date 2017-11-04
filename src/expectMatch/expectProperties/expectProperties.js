import { failed, all, any } from "@dmail/action"
import {
	matchAny,
	matchExactly,
	expectMatch,
	createMatcher,
	createExpectFromMatcherFactory
} from "../expectMatch.js"
import { expectObject, expectFunction, prefix } from "../expectType/expectType.js"
import { uneval } from "@dmail/uneval"

const compareProperties = (
	actual,
	expected,
	{ allowExtra = false, extraMustBeEnumerable = true, propertyMatcher = matchExactly }
) => {
	if (actual === null || actual === undefined) {
		return failed(`expect a function or an object to compare properties but got ${actual}`)
	}

	return any([expectObject(actual), expectFunction(actual)]).then(
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
							name !== "prototype"
					)
				}
				return names
			}

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)
			const propertyExpectations = []

			expectedPropertyNames.forEach(name => {
				if (actualPropertyNames.includes(name)) {
					propertyExpectations.push(
						expectMatch(actual[name], propertyMatcher(expected[name])).then(
							null,
							message => `${name} property mismatch: ${message}`
						)
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
				`expect a function or an object to compare properties but got ${prefix(
					typeof actual
				)}: ${uneval(actual)}`
			)
	)
}

// const mapObject = (object, fn) => {
// 	const mappedObject = {}
// 	Object.keys(object).forEach((name, index) => {
// 		mappedObject[name] = fn(name, index, object[name], object)
// 	})
// 	return mappedObject
// }
const fillObjectProperties = (object, names, value) => {
	names.forEach(name => {
		object[name] = value
	})
	return object
}

export const matchProperties = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: false }))
export const matchPropertiesIncludingHidden = expected =>
	createMatcher(actual => compareProperties(actual, expected, { extraMustBeEnumerable: false }))
export const matchPropertiesAllowingExtra = expected =>
	createMatcher(actual => compareProperties(actual, expected, { allowExtra: true }))
export const matchPropertyNames = (...expectedPropertyNames) =>
	createMatcher(actual =>
		compareProperties(actual, fillObjectProperties({}, expectedPropertyNames, matchAny()), {
			allowExtra: false
		})
	)
export const matchPropertyNamesAllowingExtra = (...expectedPropertyNames) =>
	createMatcher(actual =>
		compareProperties(actual, fillObjectProperties({}, expectedPropertyNames, matchAny()), {
			allowExtra: true
		})
	)

export const matchPropertiesDeep = expected =>
	createMatcher(actual =>
		compareProperties(actual, expected, {
			allowExtra: false,
			propertyMatcher: value => {
				if (value === null || (typeof value !== "object" && typeof value !== "function")) {
					return matchExactly(value)
				}
				// beware it can recurse indefinitely if the object structure is circular
				// like function with .prototype.constructor cycling back on the function
				return matchPropertiesDeep(value)
			}
		})
	)

export const expectProperties = createExpectFromMatcherFactory(matchProperties)
export const expectPropertiesIncludingHidden = createExpectFromMatcherFactory(
	matchPropertiesIncludingHidden
)
export const expectPropertiesAllowingExtra = createExpectFromMatcherFactory(
	matchPropertiesAllowingExtra
)

export const expectPropertyNames = createExpectFromMatcherFactory(matchPropertyNames)
export const expectPropertyNamesAllowingExtra = createExpectFromMatcherFactory(
	matchPropertyNamesAllowingExtra
)

export const expectPropertiesDeep = createExpectFromMatcherFactory(matchPropertiesDeep)
