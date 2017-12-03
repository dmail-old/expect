https://github.com/dmail/schema/tree/d1f3895ba89b1ee961610bd3722aa6d9c9cb31b8/lib/instruction/assert

Et ça?

```javascript
expect(10, matchAll(anyNumberAbove(10), not(20)))

expect(() => {}, throwMatch(any()))
expect(() => {}, throwMatch(10))

expect(thenable, resolveMatch(any()))
expect(thenable, resolveMatch(10))
expect(thenable, rejectMatch(any()))
expect(thenable, rejectMatch(10))

expect(spy, firstCallMatch(matchAll(calledWith(0, 1), calledIn(anyNumberAbove(10)))))

expect(thenable, rejectMatch(firstCallMatch(called())))

// comment faire ce qui est ci-dessous?
// callMatchAll pourrais lire les matchers
// qui le compose est en déduire ce qu'on expect
// bref c'est à réfléchir parce qu'on a pas du tout ce qu'il faut pour le moment
expect(
  () => {},
  callMatchAll(
    callSpyTwice(spyA, [[calledWith("a-0"), calledWith("a-1")]),
    callSpyOnce(spyB, [calledWith("b-0")]),
    callSpiesSequenceOnce(spyA, spyB),
    returnMatch(any())
  )
)
```
