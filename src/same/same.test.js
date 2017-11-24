import {
	expectMatch,
	createMatcher,
	createExpectFromMatcherFactory,
	expectTrue,
	expectFalse,
	expectNull,
	expectUndefined,
	expectNot
} from "./expectMatch.js"
import { createTest } from "@dmail/test"
import assert from "assert"
import { createSpy } from "@dmail/spy"
import { failed, passed } from "@dmail/action"

const assertPassedWith = (action, value) => {
	assert.equal(action.getState(), "passed")
	assert.equal(action.getResult(), value)
}

const assertFailedWith = (action, value) => {
	assert.equal(action.getState(), "failed")
	assert.equal(action.getResult(), value)
}

export default createTest({
	"expectMatch compare strict equality": ({ pass }) => {
		assertPassedWith(expectMatch(0, 0))
		assertFailedWith(expectMatch(0, "0"), `0 does not match "0"`)
		pass()
	},
	"createMatcher used with expectMatch": ({ pass }) => {
		const matchFn = createSpy(() => failed(10))
		const matcher = createMatcher(matchFn)
		const actual = 1
		assertFailedWith(expectMatch(actual, matcher), 10)
		assert.deepEqual(matchFn.track(0).createReport().argValues, [actual])
		pass()
	},
	"createExpectFromMatcherFactory returns a function": ({ pass }) => {
		const matcherFactory = createSpy(() => createMatcher(() => failed("fail")))
		const expect = createExpectFromMatcherFactory(matcherFactory)
		assertFailedWith(expect(10, 20, 30), "fail")
		assert.deepEqual(matcherFactory.track(0).createReport().argValues, [20, 30])
		pass()
	},
	"expectTrue with true": ({ pass }) => {
		assertPassedWith(expectTrue(true))
		pass()
	},
	"expectTrue with false": ({ pass }) => {
		assertFailedWith(expectTrue(false), "false does not match true")
		pass()
	},
	"expectFalse with true": ({ pass }) => {
		assertFailedWith(expectFalse(true), "true does not match false")
		pass()
	},
	"expectFalse with false": ({ pass }) => {
		assertPassedWith(expectFalse(false))
		pass()
	},
	"expectNull with null": ({ pass }) => {
		assertPassedWith(expectNull(null))
		pass()
	},
	"expectNull with undefined": ({ pass }) => {
		assertFailedWith(expectNull(undefined), "undefined does not match null")
		pass()
	},
	"expectUndefined with undefined": ({ pass }) => {
		assertPassedWith(expectUndefined(undefined))
		pass()
	},
	"expectUndefined with null": ({ pass }) => {
		assertFailedWith(expectUndefined(null), "null does not match undefined")
		pass()
	},
	"expectNot(null, null)": ({ pass }) => {
		assertFailedWith(expectNot(null, null), "null matching null")
		pass()
	},
	"expectNot(null, undefined)": ({ pass }) => {
		assertPassedWith(expectNot(null, undefined))
		pass()
	},
	"expectNot(10, customMatcherPassing": ({ pass }) => {
		const customMatcherPassing = createMatcher(() => passed("foo"))
		assertFailedWith(expectNot(10, customMatcherPassing), `10 matching Matcher({})`)
		pass()
	}
})
