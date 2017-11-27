import {
	propertiesMatch,
	// havePropertiesAllowingExtra,
	// havePropertiesIncludingHidden,
} from "./propertiesMatch.js"
import { createTest } from "@dmail/test"
// import { anyNumberBelow } from "../anyNumberBelow/anyNumberBelow.js"
import assert from "assert"

const assertPassedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "passed")
}

const assertFailedWith = (action, value) => {
	assert.deepEqual(action.getResult(), value)
	assert.equal(action.getState(), "failed")
}

export default createTest({
	"propertiesMatch({})({})": ({ pass }) => {
		assertPassedWith(propertiesMatch({})({}), [])
		pass()
	},
	"propertiesMatch({ foo: true })({ foo: true })": ({ pass }) => {
		assertPassedWith(propertiesMatch({ foo: true })({ foo: true }), [undefined])
		pass()
	},
	"propertiesMatch on nested objects": ({ pass }) => {
		assertPassedWith(propertiesMatch({ foo: { bar: true } })({ foo: { bar: true } }), [[undefined]])
		pass()
	},
	"propertiesMatch on failing nested objects": ({ pass }) => {
		assertFailedWith(
			propertiesMatch({ foo: { bar: false } })({ foo: { bar: true } }),
			"foo,bar mismatch: expecting false but got true",
		)
		pass()
	},
	"propertiesMatch with extra nested property": ({ pass }) => {
		assertFailedWith(
			propertiesMatch({ foo: {} })({ foo: { bar: true } }),
			"foo mismatch: unexpected bar property",
		)
		pass()
	},
	"propertiesMatch with missing nested property": ({ pass }) => {
		assertFailedWith(
			propertiesMatch({ foo: { bar: true } })({ foo: {} }),
			"foo mismatch: missing bar property",
		)
		pass()
	},
	"propertiesMatch on matching nested circular structure": ({ pass }) => {
		const object = {
			foo: {
				bar: true,
			},
		}
		object.foo.parent = object
		const sameObject = {
			foo: {
				bar: false,
			},
		}
		sameObject.foo.parent = sameObject

		assertFailedWith(
			propertiesMatch(object)(sameObject),
			"foo,bar mismatch: expecting true but got false",
		)
		pass()
	},
	"propertiesMatch on missing nested circular structure": ({ pass }) => {
		const object = {
			foo: {
				bar: true,
			},
		}
		object.foo.parent = object
		const sameObject = {
			foo: {
				bar: true,
				parent: {},
			},
		}

		assertFailedWith(
			propertiesMatch(object)(sameObject),
			"foo,parent mismatch: missing a circular reference",
		)
		pass()
	},
	"propertiesMatch on unexpected nested circular structure": ({ pass }) => {
		const object = {
			foo: {
				bar: true,
				parent: {},
			},
		}
		const sameObject = {
			foo: {
				bar: true,
			},
		}
		sameObject.foo.parent = sameObject

		assertFailedWith(
			propertiesMatch(object)(sameObject),
			"foo,parent mismatch: unexpected circular reference",
		)
		pass()
	},
	"propertiesMatch on named arrow function": ({ pass }) => {
		const expectedArrow = () => {}
		const actualArrow = () => {}
		assertFailedWith(
			propertiesMatch(expectedArrow)(actualArrow),
			`name mismatch: expecting "expectedArrow" but got "actualArrow"`,
		)
		pass()
	},
	"propertiesMatch on anonymous arrow function": ({ pass }) => {
		assertPassedWith(propertiesMatch(() => {})(() => {}), [undefined, undefined, [undefined]])
		pass()
	},
	/*
	"expectProperties(null)": ({ pass }) => {
		assertFailedWith(
			expectProperties(null, { foo: true }),
			"expect a function or an object to compare properties but got null",
		)
		pass()
	},
	"expectProperties(undefined)": ({ pass }) => {
		assertFailedWith(
			expectProperties(undefined, { foo: true }),
			"expect a function or an object to compare properties but got undefined",
		)
		pass()
	},
	"expectProperties(true)": ({ pass }) => {
		assertFailedWith(
			expectProperties(true, { foo: true }),
			"expect a function or an object to compare properties but got a boolean: true",
		)
		pass()
	},
	"expectProperties with extra non enumerable property": ({ pass }) => {
		const actual = {}
		Object.defineProperty(actual, "name", {
			enumerable: false,
			value: "foo",
		})
		assertPassedWith(expectProperties(actual, {}), [])
		pass()
	},
	"expectProperties({}, {foo: true})": ({ pass }) => {
		assertFailedWith(expectProperties({}, { foo: true }), "missing foo property")
		pass()
	},
	"expectProperties({foo: true}, {foo: true})": ({ pass }) => {
		assertPassedWith(expectProperties({ foo: true }, { foo: true }), [undefined])
		pass()
	},
	"expectProperties({foo: true}, {})": ({ pass }) => {
		assertFailedWith(expectProperties({ foo: true }, {}), "unexpected foo property")
		pass()
	},
	"expectProperties({foo: 10}, {foo: matchBelow(5)}": ({ pass }) => {
		assertFailedWith(
			expectProperties({ foo: 10 }, { foo: matchBelow(5) }),
			"foo property mismatch: expect a number below 5 but got 10",
		)
		pass()
	},
	"expectPropertiesAllowingExtra({foo: 10}, {})": ({ pass }) => {
		assertPassedWith(expectPropertiesAllowingExtra({ foo: 10 }, {}), [])
		pass()
	},
	"expectPropertiesAllowingExtra({foo: 10, bar: true}, {foo: 10})": ({ pass }) => {
		assertPassedWith(expectPropertiesAllowingExtra({ foo: 10, bar: true }, { foo: 10 }), [
			undefined,
		])
		pass()
	},
	*/
})
