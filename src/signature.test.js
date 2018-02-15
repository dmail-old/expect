import { allPredicate, spreadPredicate, sign } from "./signature.js"
import { plan } from "@dmail/test"
import { passed } from "@dmail/action"
import assert from "assert"

export const test = plan("signature", ({ scenario, test }) => {
	scenario("allPredicate", () => {
		test("returns a function forwarding args and returning with first truthy", () => {
			const predicate = allPredicate(() => false, (a, b) => b)
			assert.equal(predicate(0, 1), 1)
			assert.equal(predicate(0, 0), undefined)
			return passed()
		})
	})

	scenario("spreadPredicate", () => {
		test("returns a function calling predicate on every arg", () => {
			const predicate = spreadPredicate((a) => a)
			assert.equal(
				predicate(0, 1),
				`unexpected arg n°1:
1`,
			)
			assert.equal(
				predicate(0, 0, 4),
				`unexpected arg n°2:
4`,
			)
			assert.equal(predicate(0, 0), false)
			return passed()
		})
	})

	scenario("sign", () => {
		test("sign(predicate, fn) returns a function throwing with and when predicate truthy", () => {
			const predicate = (arg) => (arg ? "hello" : false)
			const fn = () => "foo"
			const signed = sign(predicate, fn)
			assert.throws(() => signed(true), (e) => e.message === "hello")
			assert.equal(signed(false), "foo")
			return passed()
		})
	})
})
