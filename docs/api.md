https://github.com/dmail/schema/tree/d1f3895ba89b1ee961610bd3722aa6d9c9cb31b8/lib/instruction/assert

```javascript
// most complex example to show composition and function naming
const spyA = createSpy()
const spyB = createSpy()
const spyC = createSpy()
const fn = arg => {
	spyA(arg)
	spyB(arg + 1)
	spyA(arg + 1)
}
const thenable = {
	then: onResolve => onResolve(fn),
}

expect(
	thenable,
	aThenableWhich(
		resolveWith(
			aFunctionWhich(
				whenCalledWith(10),
				callSpyWith(spyA, 10),
				callSpyWith(spyB, 11),
				callSpyWith(spyA, 11),
				neverCallSpy(spyC),
				returnWith(undefined),
			),
		),
	),
)
```
