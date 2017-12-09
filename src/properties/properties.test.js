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
			e => e.message === `must be called with one argument, got 0`,
		)
		assert.throws(
			() => theseProperties(),
			e => e.message === `must be called with one argument, got 0`,
		)
		pass()
	},
	"called with 2 argument": ({ pass }) => {
		assert.throws(
			() => exactProperties(true, true),
			e => e.message === `must be called with one argument, got 2`,
		)
		assert.throws(
			() => theseProperties(true, true),
			e => e.message === `must be called with one argument, got 2`,
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
				actual: { foo: true },
			}
		}
		assertFailure(exactProperties, createExtraFoo, "unexpected property foo on value")
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
		assertFailure(exactProperties, factory, "value foo mismatch: expect true but got false")
		assertFailure(theseProperties, factory, "value foo mismatch: expect true but got false")
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
		assertFailure(exactProperties, factory, "value Symbol() mismatch: expect true but got false")
		assertFailure(theseProperties, factory, "value Symbol() mismatch: expect true but got false")
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
		assertFailure(exactProperties, factory, "value Symbol(foo) mismatch: expect true but got false")
		assertFailure(theseProperties, factory, "value Symbol(foo) mismatch: expect true but got false")
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

		assertFailure(
			exactProperties,
			createMismatchingNestedObject,
			"value foo bar mismatch: expect false but got true",
		)
		assertFailure(
			theseProperties,
			createMismatchingNestedObject,
			"value foo bar mismatch: expect false but got true",
		)
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
			"unexpected property bar on value foo",
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

		assertFailure(
			exactProperties,
			createCircularStructureContainingMismatch,
			"value foo bar mismatch: expect false but got true",
		)
		assertFailure(
			theseProperties,
			createCircularStructureContainingMismatch,
			"value foo bar mismatch: expect false but got true",
		)
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

		assertFailure(
			exactProperties,
			createMissingNestedCircularStructure,
			"expect value foo aaa to be a pointer to value but got an object",
		)
		assertFailure(
			theseProperties,
			createMissingNestedCircularStructure,
			"expect value foo aaa to be a pointer to value but got an object",
		)
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

		assertFailure(
			exactProperties,
			createExtraNestedCircularStructure,
			`expect value foo aaa to be an object but got a pointer to value`,
		)
		assertFailure(
			theseProperties,
			createExtraNestedCircularStructure,
			`expect value foo aaa to be an object but got a pointer to value`,
		)
		pass()
	},
	"on named arrow function": ({ pass }) => {
		const createTwoArrowFunctionsWithDifferentNames = () => {
			return {
				expected: () => {},
				actual: () => {},
			}
		}

		assertFailure(
			exactProperties,
			createTwoArrowFunctionsWithDifferentNames,
			`value name mismatch: expect "expected" but got "actual"`,
		)
		assertFailure(
			theseProperties,
			createTwoArrowFunctionsWithDifferentNames,
			`value name mismatch: expect "expected" but got "actual"`,
		)
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

		assertFailure(
			exactProperties,
			createNestedMissingHiddenProperty,
			"missing property bar on value foo",
		)
		assertFailure(
			theseProperties,
			createNestedMissingHiddenProperty,
			"missing property bar on value foo",
		)
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

		assertFailure(
			exactProperties,
			createMisMatchingHiddenProperty,
			"value foo bar mismatch: expect true but got false",
		)
		assertFailure(
			theseProperties,
			createMisMatchingHiddenProperty,
			"value foo bar mismatch: expect true but got false",
		)
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
