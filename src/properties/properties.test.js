import { exactProperties, theseProperties } from "./properties.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { createMatcherFromFunction } from "../matcher.js"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

const assertSuccess = (matcher, factory) => {
	const { actual, expected } = factory()
	assertPassedWith(matcher(expected)(actual))
}

const assertFailure = (matcher, factory, expectedFailureMessage) => {
	const { actual, expected } = factory()
	assertFailedWith(matcher(expected)(actual), expectedFailureMessage)
}

export const test = createTest({
	"called without argument": ({ pass }) => {
		assert.throws(
			() => exactProperties(),
			(e) => e.message === `1 argument missing, must be called with 1 argument`,
		)
		assert.throws(
			() => theseProperties(),
			(e) => e.message === `1 argument missing, must be called with 1 argument`,
		)
		pass()
	},
	"called with 2 argument": ({ pass }) => {
		assert.throws(
			() => exactProperties(true, true),
			(e) => e.message === `1 unexpected argument, must be called with 1 argument`,
		)
		assert.throws(
			() => theseProperties(true, true),
			(e) => e.message === `1 unexpected argument, must be called with 1 argument`,
		)
		pass()
	},
	"on both null": ({ pass }) => {
		const createBothNull = () => {
			return {
				expected: null,
				actual: null,
			}
		}
		assertSuccess(exactProperties, createBothNull)
		assertSuccess(theseProperties, createBothNull)
		pass()
	},
	"on expected null and actual non empty object": ({ pass }) => {
		const createExtraFoo = () => {
			return {
				expected: null,
				actual: { foo: true, bar: false },
			}
		}
		assertFailure(
			exactProperties,
			createExtraFoo,
			`2 unexpected property on value:

foo:
true

bar:
false

`,
		)
		assertSuccess(theseProperties, createExtraFoo)
		pass()
	},
	"on both undefined": ({ pass }) => {
		const createBothUndefined = () => {
			return {
				expected: undefined,
				actual: undefined,
			}
		}
		assertSuccess(exactProperties, createBothUndefined)
		assertSuccess(theseProperties, createBothUndefined)
		pass()
	},
	"on both being true": ({ pass }) => {
		const createBothTrue = () => {
			return {
				expected: true,
				actual: true,
			}
		}
		assertSuccess(exactProperties, createBothTrue)
		assertSuccess(theseProperties, createBothTrue)
		pass()
	},
	"on actual having inherited expected property": ({ pass }) => {
		const factory = () => {
			const actualPrototype = { foo: false }
			return {
				expected: { foo: true },
				actual: Object.create(actualPrototype),
			}
		}
		const message = `unexpected value foo:
actual is:
false

when expecting:
true
`
		assertFailure(exactProperties, factory, message)
		assertFailure(theseProperties, factory, message)
		pass()
	},
	"on actual having mismatching expected anonymous symbol": ({ pass }) => {
		const factory = () => {
			const symbol = Symbol()
			return {
				expected: {
					[symbol]: true,
				},
				actual: {
					[symbol]: false,
				},
			}
		}
		const message = `unexpected value Symbol():
actual is:
false

when expecting:
true
`
		assertFailure(exactProperties, factory, message)
		assertFailure(theseProperties, factory, message)
		pass()
	},
	"on actual having inherited expect named symbol at property": ({ pass }) => {
		const factory = () => {
			const symbol = Symbol("foo")
			const actualPrototype = {
				[symbol]: false,
			}
			return {
				expected: {
					[symbol]: true,
				},
				actual: Object.create(actualPrototype),
			}
		}
		const message = `unexpected value Symbol(foo):
actual is:
false

when expecting:
true
`
		assertFailure(exactProperties, factory, message)
		assertFailure(theseProperties, factory, message)
		pass()
	},
	"on empty objects": ({ pass }) => {
		const createMatchingEmptyObjects = () => {
			return {
				actual: {},
				expected: {},
			}
		}
		assertSuccess(exactProperties, createMatchingEmptyObjects)
		assertSuccess(theseProperties, createMatchingEmptyObjects)
		pass()
	},
	"on objects with matching properties ": ({ pass }) => {
		const createMatchingObjectWithProperty = () => {
			return {
				actual: { foo: true },
				expected: { foo: true },
			}
		}

		assertSuccess(exactProperties, createMatchingObjectWithProperty)
		assertSuccess(theseProperties, createMatchingObjectWithProperty)
		pass()
	},
	"on nested objects": ({ pass }) => {
		const createMatchingNestedObject = () => {
			return {
				actual: { foo: { bar: true } },
				expected: { foo: { bar: true } },
			}
		}
		assertSuccess(exactProperties, createMatchingNestedObject)
		assertSuccess(theseProperties, createMatchingNestedObject)
		pass()
	},
	"on mismatch nested objects": ({ pass }) => {
		const createMismatchingNestedObject = () => {
			return {
				expected: { foo: { bar: false } },
				actual: { foo: { bar: true } },
			}
		}

		const message = `unexpected value foo bar:
actual is:
true

when expecting:
false
`

		assertFailure(exactProperties, createMismatchingNestedObject, message)
		assertFailure(theseProperties, createMismatchingNestedObject, message)
		pass()
	},
	"on extra nested property": ({ pass }) => {
		const createNestedExtraProperty = () => {
			return {
				expected: { foo: {} },
				actual: { foo: { bar: true } },
			}
		}

		assertFailure(
			exactProperties,
			createNestedExtraProperty,
			`1 unexpected property on value foo:

bar:
true

`,
		)
		assertSuccess(theseProperties, createNestedExtraProperty)

		pass()
	},
	"on missing nested property": ({ pass }) => {
		const createNestedMissingProperty = () => {
			return {
				expected: { foo: { bar: true } },
				actual: { foo: {} },
			}
		}

		assertFailure(exactProperties, createNestedMissingProperty, "missing property bar on value foo")
		assertFailure(theseProperties, createNestedMissingProperty, "missing property bar on value foo")
		pass()
	},
	"on nested circular structure mismatch": ({ pass }) => {
		const createCircularStructureContainingMismatch = () => {
			const actual = {
				foo: {
					bar: true,
				},
			}
			actual.foo.aaa = actual
			const expected = {
				foo: {
					bar: false,
				},
			}
			expected.foo.aaa = expected
			return {
				actual,
				expected,
			}
		}

		const message = `unexpected value foo bar:
actual is:
true

when expecting:
false
`

		assertFailure(exactProperties, createCircularStructureContainingMismatch, message)
		assertFailure(theseProperties, createCircularStructureContainingMismatch, message)
		pass()
	},
	"on missing nested circular structure": ({ pass }) => {
		const createMissingNestedCircularStructure = () => {
			const expected = {
				foo: {
					bar: false,
				},
			}
			expected.foo.aaa = expected
			const actual = {
				foo: {
					bar: false,
				},
			}
			actual.foo.aaa = {}

			return {
				expected,
				actual,
			}
		}

		const message = `unexpected value foo aaa:
actual is:
{}

when expecting:
a pointer to value
`

		assertFailure(exactProperties, createMissingNestedCircularStructure, message)
		assertFailure(theseProperties, createMissingNestedCircularStructure, message)
		pass()
	},
	"on unexpected nested circular structure": ({ pass }) => {
		const createExtraNestedCircularStructure = () => {
			const expected = {
				foo: {
					bar: true,
				},
			}
			expected.foo.aaa = {}
			const actual = {
				foo: {
					bar: true,
				},
			}
			actual.foo.aaa = actual

			return {
				actual,
				expected,
			}
		}

		const message = `unexpected value foo aaa:
actual is:
a pointer to value

when expecting:
{}
`

		assertFailure(exactProperties, createExtraNestedCircularStructure, message)
		assertFailure(theseProperties, createExtraNestedCircularStructure, message)
		pass()
	},
	"on named arrow function": ({ pass }) => {
		const createTwoArrowFunctionsWithDifferentNames = () => {
			return {
				expected: () => {},
				actual: () => {},
			}
		}

		const message = `unexpected value name:
actual is:
"actual"

when expecting:
"expected"
`

		assertFailure(exactProperties, createTwoArrowFunctionsWithDifferentNames, message)
		assertFailure(theseProperties, createTwoArrowFunctionsWithDifferentNames, message)
		pass()
	},
	"on anonymous arrow function": ({ pass }) => {
		assertPassedWith(exactProperties(() => {})(() => {}))
		assertPassedWith(theseProperties(() => {})(() => {}))
		pass()
	},
	"on extra hidden nested property": ({ pass }) => {
		const createNestedExtraHiddenProperty = () => {
			const expected = {
				foo: {},
			}
			const actual = {
				foo: {},
			}
			Object.defineProperty(actual.foo, "bar", {
				enumerable: false,
				value: true,
			})
			return {
				expected,
				actual,
			}
		}

		assertSuccess(exactProperties, createNestedExtraHiddenProperty)
		assertSuccess(theseProperties, createNestedExtraHiddenProperty)
		pass()
	},
	"on missing hidden property": ({ pass }) => {
		const createNestedMissingHiddenProperty = () => {
			const expected = {
				foo: {},
			}
			Object.defineProperty(expected.foo, "bar", {
				enumerable: false,
				value: true,
			})
			const actual = {
				foo: {},
			}
			return {
				expected,
				actual,
			}
		}

		const message = `missing property bar on value foo`

		assertFailure(exactProperties, createNestedMissingHiddenProperty, message)
		assertFailure(theseProperties, createNestedMissingHiddenProperty, message)
		pass()
	},
	"on mismatch on hidden nested property": ({ pass }) => {
		const createMisMatchingHiddenProperty = () => {
			const expected = { foo: {} }
			Object.defineProperty(expected.foo, "bar", {
				enumerable: false,
				value: true,
			})
			const actual = { foo: {} }
			Object.defineProperty(actual.foo, "bar", {
				enumerable: false,
				value: false,
			})
			return { expected, actual }
		}

		const message = `unexpected value foo bar:
actual is:
false

when expecting:
true
`

		assertFailure(exactProperties, createMisMatchingHiddenProperty, message)
		assertFailure(theseProperties, createMisMatchingHiddenProperty, message)
		pass()
	},
	"on custom assertion": ({ pass }) => {
		const createWithCustomAssertion = () => {
			return {
				expected: {
					foo: createMatcherFromFunction(({ pass }) => pass())(null),
				},
				actual: {
					foo: {},
				},
			}
		}
		assertSuccess(exactProperties, createWithCustomAssertion)
		pass()
	},
})
