import { propertiesMatching, strictPropertiesMatching } from "./properties.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { createMatcher } from "../matcher.js"
import { passed } from "@dmail/action"

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

export default createTest({
	"called without argument": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(),
			e => e.message === `propertiesMatching must be called with one argument, got 0`,
		)
		assert.throws(
			() => strictPropertiesMatching(),
			e => e.message === `strictPropertiesMatching must be called with one argument, got 0`,
		)
		pass()
	},
	"called with 2 argument": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(true, true),
			e => e.message === `propertiesMatching must be called with one argument, got 2`,
		)
		assert.throws(
			() => strictPropertiesMatching(true, true),
			e => e.message === `strictPropertiesMatching must be called with one argument, got 2`,
		)
		pass()
	},
	"called with null": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(null),
			e =>
				e.message ===
				`propertiesMatching first argument must be able to hold properties but it was called with
null
You can use an object, array or function for instance`,
		)
		assert.throws(
			() => strictPropertiesMatching(null),
			e =>
				e.message ===
				`strictPropertiesMatching first argument must be able to hold properties but it was called with
null
You can use an object, array or function for instance`,
		)
		pass()
	},
	"with actual being null": ({ pass }) => {
		assertFailedWith(
			propertiesMatching({})(null),
			"cannot compare properties of null: it has no properties",
		)
		assertFailedWith(
			strictPropertiesMatching({})(null),
			"cannot compare properties of null: it has no properties",
		)
		pass()
	},
	"with actual being undefined": ({ pass }) => {
		assertFailedWith(
			propertiesMatching({})(undefined),
			"cannot compare properties of undefined: it has no properties",
		)
		assertFailedWith(
			strictPropertiesMatching({})(undefined),
			"cannot compare properties of undefined: it has no properties",
		)
		pass()
	},
	"with actual being true": ({ pass }) => {
		assertFailedWith(propertiesMatching({})(true), "cannot compare properties of a boolean: true")
		assertFailedWith(
			strictPropertiesMatching({})(true),
			"cannot compare properties of a boolean: true",
		)
		pass()
	},
	"on empty objects": ({ pass }) => {
		const createMatchingEmptyObjects = () => {
			return {
				actual: {},
				expected: {},
			}
		}

		assertSuccess(propertiesMatching, createMatchingEmptyObjects)
		assertSuccess(strictPropertiesMatching, createMatchingEmptyObjects)
		pass()
	},
	"on objects with matching properties ": ({ pass }) => {
		const createMatchingObjectWithProperty = () => {
			return {
				actual: { foo: true },
				expected: { foo: true },
			}
		}

		assertSuccess(propertiesMatching, createMatchingObjectWithProperty)
		assertSuccess(strictPropertiesMatching, createMatchingObjectWithProperty)
		pass()
	},
	"on nested objects": ({ pass }) => {
		const createMatchingNestedObject = () => {
			return {
				actual: { foo: { bar: true } },
				expected: { foo: { bar: true } },
			}
		}
		assertSuccess(propertiesMatching, createMatchingNestedObject)
		assertSuccess(strictPropertiesMatching, createMatchingNestedObject)
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
			propertiesMatching,
			createMismatchingNestedObject,
			"value foo bar mismatch: expect false but got true",
		)
		assertFailure(
			strictPropertiesMatching,
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

		assertSuccess(propertiesMatching, createNestedExtraProperty)
		assertFailure(
			strictPropertiesMatching,
			createNestedExtraProperty,
			"unexpected bar property on value foo",
		)

		pass()
	},
	"on missing nested property": ({ pass }) => {
		const createNestedMissingProperty = () => {
			return {
				expected: { foo: { bar: true } },
				actual: { foo: {} },
			}
		}

		assertFailure(
			propertiesMatching,
			createNestedMissingProperty,
			"expect bar property on value foo but missing",
		)
		assertFailure(
			strictPropertiesMatching,
			createNestedMissingProperty,
			"expect bar property on value foo but missing",
		)
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
			propertiesMatching,
			createCircularStructureContainingMismatch,
			"value foo bar mismatch: expect false but got true",
		)
		assertFailure(
			strictPropertiesMatching,
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
			propertiesMatching,
			createMissingNestedCircularStructure,
			"expect value foo aaa to be a circular reference but got an object",
		)
		assertFailure(
			strictPropertiesMatching,
			createMissingNestedCircularStructure,
			"expect value foo aaa to be a circular reference but got an object",
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

		assertSuccess(propertiesMatching, createExtraNestedCircularStructure)
		assertFailure(
			strictPropertiesMatching,
			createExtraNestedCircularStructure,
			`expect value foo aaa to be an object but got a circular reference`,
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
			propertiesMatching,
			createTwoArrowFunctionsWithDifferentNames,
			`value name mismatch: expect "expected" but got "actual"`,
		)
		assertFailure(
			strictPropertiesMatching,
			createTwoArrowFunctionsWithDifferentNames,
			`value name mismatch: expect "expected" but got "actual"`,
		)
		pass()
	},
	"on anonymous arrow function": ({ pass }) => {
		assertPassedWith(propertiesMatching(() => {})(() => {}))
		assertPassedWith(strictPropertiesMatching(() => {})(() => {}))
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

		assertSuccess(propertiesMatching, createNestedExtraHiddenProperty)
		assertSuccess(strictPropertiesMatching, createNestedExtraHiddenProperty)
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
			propertiesMatching,
			createNestedMissingHiddenProperty,
			"expect bar property on value foo but missing",
		)
		assertFailure(
			strictPropertiesMatching,
			createNestedMissingHiddenProperty,
			"expect bar property on value foo but missing",
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
			propertiesMatching,
			createMisMatchingHiddenProperty,
			"value foo bar mismatch: expect true but got false",
		)
		assertFailure(
			strictPropertiesMatching,
			createMisMatchingHiddenProperty,
			"value foo bar mismatch: expect true but got false",
		)
		pass()
	},
	"with custom matcher": ({ pass }) => {
		const expected = {
			foo: createMatcher(() => passed()),
		}
		const actual = {
			foo: {},
		}
		assertPassedWith(propertiesMatching(expected)(actual))
		pass()
	},
})
