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

const createMatchingEmptyObjects = () => {
	return {
		actual: {},
		expected: {},
	}
}

const createMatchingObjectWithProperty = () => {
	return {
		actual: { foo: true },
		expected: { foo: true },
	}
}

const createMatchingNestedObject = () => {
	return {
		actual: { foo: { bar: true } },
		expected: { foo: { bar: true } },
	}
}

const createMismatchingNestedObject = () => {
	return {
		expected: { foo: { bar: false } },
		actual: { foo: { bar: true } },
	}
}

const createNestedExtraProperty = () => {
	return {
		expected: { foo: {} },
		actual: { foo: { bar: true } },
	}
}

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

const createNestedMissingProperty = () => {
	return {
		expected: { foo: { bar: true } },
		actual: { foo: {} },
	}
}

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

const createTwoArrowFunctionsWithDifferentNames = () => {
	return {
		expected: () => {},
		actual: () => {},
	}
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
	"propertiesMatching called without argument": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(),
			e => e.message === `propertiesMatching must be called with one argument, got 0`,
		)
		pass()
	},
	"propertiesMatching called with 2 argument": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(true, true),
			e => e.message === `propertiesMatching must be called with one argument, got 2`,
		)
		pass()
	},
	"propertiesMatching called with null": ({ pass }) => {
		assert.throws(
			() => propertiesMatching(null),
			e =>
				e.message ===
				`propertiesMatching expect first argument to be able to hold properties but was called with
null
You can use an object, array or function for instance`,
		)
		pass()
	},
	"propertiesMatching with actual being null": ({ pass }) => {
		assertFailedWith(
			propertiesMatching({})(null),
			"cannot compare properties of null: it has no properties",
		)
		pass()
	},
	"propertiesMatching with actual being undefined": ({ pass }) => {
		assertFailedWith(
			propertiesMatching({})(undefined),
			"cannot compare properties of undefined: it has no properties",
		)
		pass()
	},
	"propertiesMatching with actual being true": ({ pass }) => {
		assertFailedWith(propertiesMatching({})(true), "cannot compare properties of a boolean: true")
		pass()
	},
	"propertiesMatching on empty objects": ({ pass }) => {
		assertSuccess(propertiesMatching, createMatchingEmptyObjects)
		pass()
	},
	"propertiesMatching on objects with matching properties ": ({ pass }) => {
		assertSuccess(propertiesMatching, createMatchingObjectWithProperty)
		pass()
	},
	"propertiesMatching on nested objects": ({ pass }) => {
		assertSuccess(propertiesMatching, createMatchingNestedObject)
		pass()
	},
	"propertiesMatching on mismatch nested objects": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createMismatchingNestedObject,
			"foo,bar mismatch: expecting false but got true",
		)
		pass()
	},
	"propertiesMatching on extra nested property": ({ pass }) => {
		assertSuccess(propertiesMatching, createNestedExtraProperty)
		pass()
	},
	"propertiesMatching on missing nested property": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createNestedMissingProperty,
			"foo mismatch: missing bar property",
		)
		pass()
	},
	"propertiesMatching on nested circular structure mismatch": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createCircularStructureContainingMismatch,
			"foo,bar mismatch: expecting false but got true",
		)
		pass()
	},
	"propertiesMatching on missing nested circular structure": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createMissingNestedCircularStructure,
			"foo,aaa mismatch: missing a circular reference",
		)
		pass()
	},
	"propertiesMatching on unexpected nested circular structure": ({ pass }) => {
		assertSuccess(propertiesMatching, createExtraNestedCircularStructure)
		pass()
	},
	"propertiesMatching on named arrow function": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createTwoArrowFunctionsWithDifferentNames,
			`name mismatch: expecting "expected" but got "actual"`,
		)
		pass()
	},
	"propertiesMatching on anonymous arrow function": ({ pass }) => {
		assertPassedWith(propertiesMatching(() => {})(() => {}))
		pass()
	},
	"propertiesMatching on extra hidden nested property": ({ pass }) => {
		assertSuccess(propertiesMatching, createNestedExtraHiddenProperty)
		pass()
	},
	"propertiesMatching on missing hidden property": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createNestedMissingHiddenProperty,
			"foo mismatch: missing bar property",
		)
		pass()
	},
	"propertiesMatching on mismatch on hidden nested property": ({ pass }) => {
		assertFailure(
			propertiesMatching,
			createMisMatchingHiddenProperty,
			"foo,bar mismatch: expecting true but got false",
		)
		pass()
	},
	"propertiesMatching with custom matcher": ({ pass }) => {
		const expected = {
			foo: createMatcher(() => passed()),
		}
		const actual = {
			foo: {},
		}
		assertPassedWith(propertiesMatching(expected)(actual))
		pass()
	},
	"strictPropertiesMatching with extra nested property": ({ pass }) => {
		assertFailure(
			strictPropertiesMatching,
			createNestedExtraProperty,
			"foo mismatch: unexpected bar property",
		)
		pass()
	},
	"strictPropertiesMatching with missing nested property": ({ pass }) => {
		assertFailure(
			strictPropertiesMatching,
			createNestedMissingProperty,
			"foo mismatch: missing bar property",
		)
		pass()
	},
	"strictPropertiesMatching nested circular structure mismatch": ({ pass }) => {
		assertFailure(
			strictPropertiesMatching,
			createCircularStructureContainingMismatch,
			"foo,bar mismatch: expecting false but got true",
		)
		pass()
	},
	"strictPropertiesMatching on missing nested circular structure": ({ pass }) => {
		assertFailure(
			strictPropertiesMatching,
			createMissingNestedCircularStructure,
			"foo,aaa mismatch: missing a circular reference",
		)
		pass()
	},
	"strictPropertiesMatching on unexpected nested circular structure": ({ pass }) => {
		assertFailure(
			strictPropertiesMatching,
			createExtraNestedCircularStructure,
			"foo,aaa mismatch: unexpected circular reference",
		)
		pass()
	},
})
