https://github.com/dmail/schema/tree/d1f3895ba89b1ee961610bd3722aa6d9c9cb31b8/lib/instruction/assert

```javascript
/*
Some explanation:
assert(actual, expected) is used as entry point and is almost equivalent to
expected(actual)

every function starting with expect is used to do something with the value first and then
to use the result of what we have done with the value to compare with a matcher

expectResolve(matcher) will resolve the thenable an apply matcher on resolved value

comment s'assurer d'un effet de bord d'une fonction qui aurait définit une méthode
foo sur mon object?
l'objet étant externe et non pas quelque chose que je peux obtenir
depuis actual il faut que je puisse l'introduire un peut comme ce que fais
expectResolve en allat lire une valeur + ou - indépendante de la valeur actual courante

expect
*/

assert(10, expectAll(expectAnyNumberAbove(10), expectNot(20)))

assert(thenable, expectResolve(expectAny()))
assert(thenable, expectResolve(expect(10))
assert(thenable, expectReject(expectAny()))
assert(thenable, expectReject(expect(10))
assert(thenable, expectReject(expectFirstCall(called())))

const object = {}
assert(() => {
  object.foo = "bar"
}, callExpecting(
  expectFrom(object, expectProperty("foo", expectAny(String))
)

assert(() => {
  throw null
}, callExpecting(expectThrow(expectAny()))
assert(() => {
  throw 10
}, callExpecting(expectThrow(expect(10)))
assert(() => true, callExpecting(expectReturn(expectAny(Boolean)))

assert(spy, expectFirstCall(
  expectAll(
    expectCalledWith(0, 1),
    expectCalledIn(expectAnyNumberAbove(10))
  )
))

assert(
  () => {
    spyA("a-0")
    spyB("b-0")
    spyA("a-1")
    return undefined
  },
  callExpecting(
    expectAll(
      expectSpyCalls(spyA, [[expectCalledWith("a-0"), expectCalledWith("a-1")]),
      expectSpyCalls(spyB, [expectCalledWith("b-0")]),
      expectSpyCalls(spyC, []),
      expectSpySequenceOnce(spyA, spyB),
      expectReturn(any())
    )
  )
)
```
