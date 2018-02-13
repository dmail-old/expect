import { test } from "@dmail/test"
import assert from "assert"

/* eslint-disable no-new-wrappers */

const createMatchContract = () => {}
const createFailureMessage = () => {}

const execute = (expected, actual) => {
	const contract = createMatchContract(expected)
	const result = contract.execute(actual)
	const execution = result.getResult()
	const message = createFailureMessage(execution)

	return { contract, result, execution, message }
}

const mustFailWith = (expected, actual, expectedMessage) => {
	const { message } = execute(expected, actual)
	assert.equal(message, expectedMessage)
}

const mustPass = (expected, actual) => {
	const { status } = execute(expected, actual)
	assert.equal(status, "passed")
}

// boolean primitive
test(() => {
	mustPass(true, true)

	mustPass(false, false)

	mustFailWith(
		true,
		false,
		`mismatch on:
value

actual:
false

expected:
true`,
	)

	mustFailWith(
		false,
		true,
		`mismatch on:
value

actual:
true

expected:
false`,
	)
})

// constructed primitive
test(() => {
	mustPass(new Boolean(true), new Boolean(true))

	mustPass(new Boolean(false), new Boolean(false))

	mustFailWith(
		new Boolean(true),
		new Boolean(false),
		`mismatch on:
valueOf() return value

actual:
false

expected:
true`,
	)

	mustFailWith(
		new Boolean(false),
		new Boolean(true),
		`mismatch on:
valueOf() return value

actual:
true

expected:
false`,
	)
})

// primitive under a property
test(() => {
	const createFooValue = (value) => ({ foo: value })

	mustPass(createFooValue(true), createFooValue(true))

	mustPass(createFooValue(false), createFooValue(false))

	mustFailWith(
		createFooValue(true),
		createFooValue(false),
		`mismatch on:
foo property value

actual:
false

expected:
true`,
	)

	mustFailWith(
		createFooValue(false),
		createFooValue(true),
		`mismatch on:
foo property value

actual:
true

expected:
false`,
	)
})

// inherited property
test(() => {
	const createInheritedFoo = () => Object.create({ foo: true })

	const createOwnFoo = () => ({ foo: true })

	const createWithoutFoo = () => ({})

	mustPass(createInheritedFoo(), createWithoutFoo())

	mustPass(createWithoutFoo(), createInheritedFoo())

	mustFailWith(
		createInheritedFoo(),
		createOwnFoo(),
		`mismatch on:
value

actual:
1 extra properties: foo

expected:
no own properties
`,
	)

	mustFailWith(
		createOwnFoo(),
		createInheritedFoo(),
		`mismatch on:
value foo own property presence

actual:
false

expected:
true
`,
	)
})

// property writability
test(() => {
	const createWritable = () => Object.defineProperty({}, "foo", { value: true, writable: true })
	const createNonWritable = () => Object.defineProperty({}, "foo", { value: true, writable: false })

	mustPass(createWritable(), createWritable())

	mustPass(createNonWritable(), createNonWritable())

	mustFailWith(
		createWritable(),
		createNonWritable(),
		`mismatch on:
foo property writable

actual:
false

expected:
true`,
	)

	mustFailWith(
		createNonWritable(),
		createWritable(),
		`mismatch on:
foo property writable

actual:
true

expected:
false`,
	)
})

// property enumerability
test(() => {
	const createEnumerable = () => Object.defineProperty({}, "foo", { value: true, enumerable: true })
	const createNonEnumerable = () =>
		Object.defineProperty({}, "foo", { value: true, enumerable: false })

	mustPass(createEnumerable(), createEnumerable())

	mustPass(createNonEnumerable(), createNonEnumerable())

	mustFailWith(
		createEnumerable(),
		createNonEnumerable(),
		`mismatch on:
foo property enumerable

actual:
false

expected:
true`,
	)

	mustFailWith(
		createNonEnumerable(),
		createEnumerable(),
		`mismatch on:
foo property enumerable

actual:
true

expected:
false`,
	)
})

// property configurability
test(() => {
	const createConfigurable = () =>
		Object.defineProperty({}, "foo", { value: true, configurable: true })
	const createNonConfigurable = () =>
		Object.defineProperty({}, "foo", { value: true, configurable: false })

	mustPass(createConfigurable(), createConfigurable())

	mustPass(createNonConfigurable(), createNonConfigurable())

	mustFailWith(
		createConfigurable(),
		createNonConfigurable(),
		`mismatch on:
foo property configurable

actual:
false

expected:
true`,
	)

	mustFailWith(
		createNonConfigurable(),
		createConfigurable(),
		`mismatch on:
foo property configurable

actual:
true

expected:
false`,
	)
})

// circular reference on property value
test(() => {
	const createObjectWithCircularReferenceOnFoo = () => {
		const object = {
			foo: {},
		}
		object.foo.parent = object
		return object
	}
	const createObjectWithoutCircularReferenceOnFoo = () => {
		const object = {
			foo: {},
		}
		object.foo.parent = null
		return object
	}

	mustPass(createObjectWithCircularReferenceOnFoo(), createObjectWithCircularReferenceOnFoo())

	mustFailWith(
		createObjectWithCircularReferenceOnFoo(),
		createObjectWithoutCircularReferenceOnFoo(),
		`mismatch on:
value foo parent value

actual:
null

expected:
a reference to value`,
	)
})

// property getter/setter
test(() => {
	const createFooWithGetterAndSetter = () =>
		Object.defineProperty({}, "foo", {
			get: () => {},
			set: () => {},
		})

	const createFooWithGetter = () => Object.defineProperty({}, "foo", { get: () => {} })

	const createFooWithoutGetter = () => ({ foo: true })

	mustPass(createFooWithGetter(), createFooWithGetter())

	mustPass(createFooWithGetterAndSetter(), createFooWithGetterAndSetter())

	mustFailWith(
		createFooWithGetter(),
		createFooWithGetterAndSetter(),
		`mismatch on:
value foo property setter presence

actual:
true

expected:
false`,
	)

	mustFailWith(
		createFooWithGetterAndSetter(),
		createFooWithGetter(),
		`mismatch on:
value foo property setter presence

actual:
false

expected:
true`,
	)

	mustFailWith(
		createFooWithGetter(),
		createFooWithoutGetter(),
		`mismatch on:
value foo property getter presence

actual:
false

expected
true`,
	)
})

// circular reference on getter
test(() => {
	const createObjectWithCircularReferenceOnGetter = () => {
		const getter = () => {}
		return Object.defineProperty({ getter }, "foo", {
			get: getter,
		})
	}
	const createObjectWithoutCircularReferenceOnGetter = () => {
		const getter = () => {}
		return Object.defineProperty({ getter }, "foo", {
			get: () => {},
		})
	}

	mustPass(createObjectWithCircularReferenceOnGetter(), createObjectWithCircularReferenceOnGetter())

	mustFailWith(
		createObjectWithCircularReferenceOnGetter(),
		createObjectWithoutCircularReferenceOnGetter(),
		`mismatch on:
value foo get

actual:
() => {}

expected:
a reference to value getter
`,
	)
})

// circular reference on setter
