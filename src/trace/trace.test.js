import { createAnonymousValueTrace } from "./trace.js"
import { createTest } from "@dmail/test"
import assert from "assert"

export const test = createTest({
	"trace from anonymous value & existing property & abstract property": ({ pass }) => {
		const value = {
			foo: true,
		}
		const trace = createAnonymousValueTrace(value)
		assert.equal(trace.getDepth(), 0)
		assert.equal(trace.getName(), "value")
		assert.equal(trace.getParentTrace(), null)
		assert.equal(trace.getValue(), value)

		assert.equal(trace.getFirstTraceFor(value), trace)
		assert.equal(trace.getFirstTraceFor(true), null)
		assert.equal(trace.getFirstTraceFor(undefined), null)

		const fooTrace = trace.readProperty("foo")
		assert.equal(fooTrace.getDepth(), 1)
		assert.equal(fooTrace.getName(), "foo")
		assert.equal(fooTrace.getParentTrace(), trace)
		assert.equal(fooTrace.getValue(), true)

		assert.equal(fooTrace.getFirstTraceFor(value), trace)
		assert.equal(fooTrace.getFirstTraceFor(true), fooTrace)
		assert.equal(fooTrace.getFirstTraceFor(undefined), null)

		// a part of the concept is to support abstract property (a property which is not set)
		const barTrace = trace.readProperty("bar")
		assert.equal(barTrace.getDepth(), 1)
		assert.equal(barTrace.getName(), "bar")
		assert.equal(barTrace.getParentTrace(), trace)
		assert.equal(barTrace.getValue(), undefined)

		assert.equal(barTrace.getFirstTraceFor(value), trace)
		assert.equal(barTrace.getFirstTraceFor(true), fooTrace)
		assert.equal(barTrace.getFirstTraceFor(undefined), barTrace)

		// history is mutate so trace is know awar of fooTrace & barTrace
		assert.equal(trace.getFirstTraceFor(value), trace)
		assert.equal(trace.getFirstTraceFor(true), fooTrace)
		assert.equal(trace.getFirstTraceFor(undefined), barTrace)

		pass()
	},
	"trace on value with circular reference": ({ pass }) => {
		const value = {}
		value.parent = value

		const trace = createAnonymousValueTrace(value)
		const parentTrace = trace.readProperty("parent")

		assert.equal(parentTrace.getFirstTraceFor(value), trace)
		pass()
	},
	"trace on value with circular nested reference": ({ pass }) => {
		const value = {
			foo: {},
		}
		value.foo.self = value.foo
		const trace = createAnonymousValueTrace(value)
		const fooTrace = trace.readProperty("foo")
		const selfTrace = fooTrace.readProperty("self")
		assert.equal(selfTrace.getFirstTraceFor(value.foo), fooTrace)
		pass()
	},
})
