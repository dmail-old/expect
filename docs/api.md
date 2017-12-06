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
		aFunctionWhichWhenCalledWith(
			[10],
			matchAll(
				callSpy(spyA, calledWith(10)),
				callSpy(spyB, calledWith(11)),
				callSpy(spyA, calledWith(11)),
				matchNot(callSpy(spyC)),
				returnWith(undefined),
			),
		),
	),
)

// keep in mind:
// if the function was calling spyB before spyA, it would be reported as:
// "unexpected early call to spyB, spyA is expected to be called before"
// if the function was calling second spyA before spyB it must be reported as:
// "unexpected early call to spyA, spyB is expected to be called before"
// if an two extra call to spyB where done by the function it must be reported as:
// "two unexpected call to spyB, it is expected to be called once"
// if spyC was called it must be reported as
// "unxpected call to spyC, it is expected to be never called"

// the above is cool but what if :
aFunctionWhichWhenCalled(matchSomeOf(callSpy(spyA, calledWith(10)), callSpy(spyB, calledWith(11))))
// ici on voudrait donc dire soit la fonction apelle A et on est bon
// soit elle apelle B et on est bon aussi
// mais du coup si on veut s'assurer de ce qui s'est passé pendant l'apell
// on va faussement assumer qu'on veut spyA + spyB, il faut que matchSomeOf
// fasse bien la distinction entre les groupes
// pour pas qu'on assume qu'il faut spyA et spyB mais bien spyA ou spyB
```
