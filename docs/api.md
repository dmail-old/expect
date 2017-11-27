https://github.com/dmail/schema/tree/d1f3895ba89b1ee961610bd3722aa6d9c9cb31b8/lib/instruction/assert

Et ça?

```javascript
expect(10, anyNumberAbove(10), not(20))

expect(() => {}, throwMatching(any()))
expect(() => {}, throwMatching(10))
expect(
  () => {},
  callSpyOnce(
    spy,
    calledWith(0, 1),
    calledIn(10)
  )
))
expect(
  () => {},
  callSpyTwice(
    spy,
    composeMatcher([
      calledWith(0, 1),
      calledWith(10))
    ])
  )
)
expect(
  () => {},
  callSpies(
    [spyA, spyB],
    valuesMatching([
      matchAll(calledWith(10)),
      matchAll(calledWith(5))
    ])
  )
)
expect(
  () => {},
  callSpiesSequenceOnce(
    [spyA, spyB],
    composeMatcher([
      matchAll(calledWith(10), calledIn(2)),
      matchAll(calledWith(11))
    ])
  )
)

expect(thenable, resolveMatching(any()))
expect(thenable, resolveMatching(10))
expect(thenable, rejectMatching(any()))
expect(thenable, rejectMatching(10))

expect(
  spy,
  anySpyCalledOnce(calledWith(0, 1), calledIn(anyNumberAbove(10)))
)
expect(spy, anySpyCalledOnce(calledWithoutArgument())
expect(spy, anySpyCalledOnce(calledWith(0, 1)))

expect(thenable, rejectMatching(
  anySpyCalledOnce(10)
))
```
