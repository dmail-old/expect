import { createAnonymousTrace, getPointerFromTrace, comparePointer } from "./trace.js"
import { createTest } from "@dmail/test"
import assert from "assert"

export const test = createTest({
	"trace from anonymous value & existing property & abstract property": ({ pass }) => {
		const value = {
			foo: true,
		}
		const trace = createAnonymousTrace(value)
		assert.equal(trace.getDepth(), 0)
		assert.equal(trace.getName(), "value")
		assert.equal(trace.getParentTrace(), null)
		assert.equal(trace.getPreviousTrace(), null)
		assert.equal(trace.getValue(), value)

		assert.deepEqual(getPointerFromTrace(trace, value), null)
		assert.deepEqual(getPointerFromTrace(trace, true), null)
		assert.deepEqual(getPointerFromTrace(trace, undefined), null)

		const fooTrace = trace.discoverProperty("foo")
		assert.equal(fooTrace.getDepth(), 1)
		assert.equal(fooTrace.getName(), "foo")
		assert.equal(fooTrace.getParentTrace(), trace)
		assert.equal(fooTrace.getPreviousTrace(), trace)
		assert.equal(fooTrace.getValue(), true)

		assert.deepEqual(getPointerFromTrace(fooTrace, value), [trace])
		assert.deepEqual(getPointerFromTrace(fooTrace, true), null)
		assert.deepEqual(getPointerFromTrace(fooTrace, undefined), null)

		// a part of the concept is to support abstract property (a property which is not set)
		const barTrace = trace.discoverProperty("bar")
		assert.equal(barTrace.getDepth(), 1)
		assert.equal(barTrace.getName(), "bar")
		assert.equal(barTrace.getParentTrace(), trace)
		assert.equal(barTrace.getPreviousTrace(), fooTrace)
		assert.equal(barTrace.getValue(), undefined)

		assert.deepEqual(getPointerFromTrace(barTrace, value), [trace])
		assert.deepEqual(getPointerFromTrace(barTrace, true), [fooTrace])
		assert.deepEqual(getPointerFromTrace(barTrace, undefined), null)

		pass()
	},
	"trace on value with circular reference": ({ pass }) => {
		const value = {}
		value.parent = value

		const trace = createAnonymousTrace(value)
		const parentTrace = trace.discoverProperty("parent")

		assert.deepEqual(getPointerFromTrace(parentTrace), [trace])
		pass()
	},
	"trace on value with circular nested reference": ({ pass }) => {
		const value = {
			foo: {},
		}
		value.foo.self = value.foo
		const trace = createAnonymousTrace(value)
		const fooTrace = trace.discoverProperty("foo")
		const selfTrace = fooTrace.discoverProperty("self")
		assert.deepEqual(getPointerFromTrace(selfTrace), [fooTrace])
		pass()
	},
	"comparePointer matching names": ({ pass }) => {
		const expected = {}
		expected.parent = expected
		const actual = {}
		actual.parent = actual

		const expectedTrace = createAnonymousTrace(expected).discoverProperty("parent")
		const actualTrace = createAnonymousTrace(actual).discoverProperty("parent")
		const expectedPointer = getPointerFromTrace(expectedTrace, expected)
		const actualPointer = getPointerFromTrace(actualTrace, actual)

		assert.equal(comparePointer(expectedPointer, actualPointer), true)

		pass()
	},
	"comparePointer names mismatch": ({ pass }) => {
		const expected = {
			foo: {},
		}
		expected.foo.parent = expected
		const actual = {
			bar: {},
		}
		actual.bar.parent = actual

		const expectedTrace = createAnonymousTrace(expected)
			.discoverProperty("foo")
			.discoverProperty("parent")
		const actualTrace = createAnonymousTrace(actual)
			.discoverProperty("bar")
			.discoverProperty("parent")
		const expectedPointer = getPointerFromTrace(expectedTrace, expected)
		const actualPointer = getPointerFromTrace(actualTrace, actual)

		assert.equal(comparePointer(expectedPointer, actualPointer), false)
		pass()
	},
	"comparePointer depth mismatch": ({ pass }) => {
		// c'est un peu plsu compliqué, en gros les noms matchs par la structure mais
		// on est pas au même endroit
		const expected = {
			foo: true,
		}
		expected.bar = expected
		const actual = {
			foo: {},
		}
		actual.foo.bar = actual
		const expectedRootTrace = createAnonymousTrace(expected)
		expectedRootTrace.discoverProperty("foo")
		const expectedTrace = expectedRootTrace.discoverProperty("bar")
		const actualTrace = createAnonymousTrace(actual)
			.discoverProperty("foo")
			.discoverProperty("bar")
		const expectedPointer = getPointerFromTrace(expectedTrace, expected)
		const actualPointer = getPointerFromTrace(actualTrace, actual)

		assert.equal(comparePointer(expectedPointer, actualPointer), false)
		pass()
	},
})
