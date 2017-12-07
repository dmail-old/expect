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
	aThenableResolvedWith(
	  mapMatch(
		  (fn) => () => fn(10),
			aFunctionWhich(
				calls(spyA, calledWith(10)),
				// having a second spy expectation means order must be respected
				calls(spyB, calledWith(11)),
				// it means we expect two calls on spyA
				calls(spyA, calledWith(11)),
				// to be sure it does not do something unexpected
				neverCalls(spyC),
				// must not modify listed properties on object (will use ===)
				preservesProperty(object, 'foo'),
				preservesProperty(object, 'bar'),
				doesNotAddProperty(object, 'bar'),
				doesNotAddAnyProperty(object),
				// property must exist before function gets calls and be set to something matching
				updatesProperty(object, 'foo', matchAny()),
				// property must not exist before function gets calls and be set to something matching
				addsProperty(object, 'bar', matchAny()),
				returnsWith(undefined), // must be the last, and cannot coexist with throwWith
			),
		),
	),
)

// we could add isPureRegarding(objectOrFunction) wich means all properties are not modified (preservesProperty)
// and doesNotAddProperty()

// keep in mind:
// if the function was calling spyB before spyA, it would be reported as:
// "unexpected early call to spyB, spyA is expected to be called before"
// if the function was calling second spyA before spyB it must be reported as:
// "unexpected early call to spyA, spyB is expected to be called before"
// if an two extra call to spyB where done by the function it must be reported as:
// "two unexpected call to spyB, it is expected to be called once"
// if spyC was called it must be reported as
// "unxpected call to spyC, it is expected to be never called"
```
