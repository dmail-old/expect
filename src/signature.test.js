import { allPredicate, spreadPredicate, sign } from "./signature.js"
import { createTest } from "@dmail/test"
import assert from "assert"

export const test = createTest({
	"allPredicate() returns a function forwarding args and returning with first truthy": ({
		pass,
	}) => {
		const predicate = allPredicate(() => false, (a, b) => b)
		assert.equal(predicate(0, 1), 1)
		assert.equal(predicate(0, 0), undefined)
		pass()
	},
	"spreadPredicate(predicate) returns a function calling predicate on every arg": ({ pass }) => {
		const predicate = spreadPredicate((a) => a)
		assert.equal(predicate(0, 1), 1)
		assert.equal(predicate(0, 0, 4), 4)
		assert.equal(predicate(0, 0), undefined)
		pass()
	},
	"sign(predicate, fn) returns a function throwing with and when predicate truthy": ({ pass }) => {
		const predicate = (arg) => (arg ? "hello" : false)
		const fn = () => "foo"
		const signed = sign(predicate, fn)
		assert.throws(() => signed(true), (e) => e.message === "hello")
		assert.equal(signed(false), "foo")
		pass()
	},
})
