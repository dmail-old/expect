Et ça?

```javascript
expect(10, anyNumberAbove(10), not(20))

expect(() => {}, throwingWith(any()))
expect(() => {}, throwingWith(10))
expect(
  () => {},
  callingOnce(
    spy,
    calledWith(0, 1),
    calledIn(10)
  )
))
expect(
  () => {},
  callingTwice(
    spy,
    composeMatcher([
      calledWith(0, 1),
      calledWith(10))
    ])
  )
)
expect(
  () => {},
  callingInSequence(
    [spyA, spyB],
    composeMatcher([
      matchAll(calledWith(10), calledIn(2)),
      matchAll(calledWith(11))
    ])
  )
)

expect(thenable, resolvingWith(any()))
expect(thenable, resolvingWith(10))
expect(thenable, rejectingWith(any()))
expect(thenable, rejectingWith(10))

expect(
  spy,
  anySpyCalledOnce(calledWith(0, 1), calledIn(anyNumberAbove(10)))
)
expect(spy, anySpyCalledOnce(calledWithoutArgument())
expect(spy, anySpyCalledOnce(calledWith(0, 1)))

expect(thenable, rejectingWith(
  anySpyCalledOnce(10)
))
```
