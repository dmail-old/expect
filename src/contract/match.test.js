import { createMatchContract, createFailureMessage } from "./match.js"
import { test } from "@dmail/test"
import assert from "assert"

/* eslint-disable no-new-wrappers */

const execute = (expected, actual) => {
	const contract = createMatchContract(expected)
	const result = contract.execute(actual)
	const execution = result.getResult()
	const message = createFailureMessage(execution)

	return { contract, result, execution, message }
}

const testMessage = (expected, actual, expectedMessage) => {
	const { message } = execute(expected, actual)
	assert.equal(message, expectedMessage)
}

test(() => {
	testMessage(
		true,
		false,
		`mismatch on:
value

actual:
false

expected:
true`,
	)
})

test(() => {
	testMessage(
		new Boolean(true),
		new Boolean(false),
		`mismatch on:
valueOf() return value

actual:
false

expected:
true`,
	)
})

test(() => {
	testMessage(
		{ foo: true },
		{ foo: false },
		`mismatch on:
foo property value

actual:
false

expected:
true`,
	)
})

test(() => {
	const expected = {}
	Object.defineProperty(expected, "foo", {
		writable: false,
		value: true,
	})
	const actual = {}
	Object.defineProperty(actual, "foo", {
		writable: true,
		value: true,
	})
	testMessage(
		expected,
		actual,
		`mismatch on:
foo property writable

actual:
true

expected:
false`,
	)
})

// à tester:
// tester que les propriété héritée par model ne sont pas expected
// tester que les propriétés héritée par actual ne peuvent pas match ce qui est expected
// tester avec un model ayant une reference sur une de ses valeurs
// tester avec un model ayant une reference sur son getter

/*
const model = {
	getter: () => true
}
Object.defineProperty(model, 'foo', {
	get: model.getter
})
// ici on s'attend à ce que le getter sur actual.foo corresponde à actual.getter
*/
// tester avec actual ayant une référence là où on expect un objet normal
/*
const model = { self: {foo: true}}
const actual = {}
actual.self = actual
*/
