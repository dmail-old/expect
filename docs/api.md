https://github.com/dmail/schema/tree/d1f3895ba89b1ee961610bd3722aa6d9c9cb31b8/lib/instruction/assert

```javascript
/*
Some explanation:
assert(actual, matcher) is used as entry point and is almost equivalent to
matcher(actual)

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

assert(10, matchAll(anyNumberAbove(10), not(20)))

assert(thenable, expectResolve(any()))
assert(thenable, expectResolve(10))
assert(thenable, expectReject(any()))
assert(thenable, expectReject(10))
assert(thenable, expectReject(expectFirstCall(called())))

const object = {}
assert(() => {
  object.foo = "bar"
}, expectCall(
  expect(object, expectProperty("foo", any(String))
)

assert(() => {
  throw null
}, expectCall(expectThrow(any()))
assert(() => {
  throw 10
}, expectCall(expectThrow(10)))
assert(() => true, expectCall(expectReturn(Boolean)))

assert(spy, expectFirstCall(
  matchAll(
    expectArguments([0, 1]),
    expectDuration(anyNumberAbove(10))
  )
))

assert(
  () => {
    spyA("a-0")
    spyB("b-0")
    spyA("a-1")
    return undefined
  },
  expectCall(
    matchAll(
      expectSpyCalls(spyA, [[callArgumentsMatch("a-0"), callArgumentsMatch("a-1")]),
      expectSpyCalls(spyB, [callArgumentsMatch("b-0")]),
      expectSpyCalls(spyC, []),
      expectSpySequenceOnce(spyA, spyB),
      expectReturn(any())
    )
  )
)
```
