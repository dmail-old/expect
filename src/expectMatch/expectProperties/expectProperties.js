import { failed, all, any } from "@dmail/action"
import {
	matchAny,
	expectMatch,
	createMatcher,
	createExpectFromMatcherFactory
} from "../expectMatch.js"
import { expectObject, expectFunction, prefix } from "../expectType/expectType.js"
import { uneval } from "@dmail/uneval"

const compareProperties = (
	actual,
	expected,
	{ allowExtra = false, extraMustBeEnumerable = true }
) => {
	if (actual === null || actual === undefined) {
		return failed(`expect a function or an object to compare properties but got ${actual}`)
	}

	return any([expectObject(actual), expectFunction(actual)]).then(
		() => {
			const listNames = Object.getOwnPropertyNames

			const actualPropertyNames = listNames(actual)
			const expectedPropertyNames = listNames(expected)
			const propertyExpectations = []

			expectedPropertyNames.forEach(name => {
				if (actualPropertyNames.includes(name)) {
					propertyExpectations.push(
						expectMatch(actual[name], expected[name]).then(
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

export const expectProperties = createExpectFromMatcherFactory(matchProperties)
export const expectPropertiesAllowingExtra = createExpectFromMatcherFactory(
	matchPropertiesAllowingExtra
)
export const expectPropertyNames = createExpectFromMatcherFactory(matchPropertyNames)
export const expectPropertyNamesAllowingExtra = createExpectFromMatcherFactory(
	matchPropertyNamesAllowingExtra
)
export const expectPropertiesIncludingHidden = createExpectFromMatcherFactory(
	matchPropertiesIncludingHidden
)
