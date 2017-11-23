/*
de plus j'ai déjà pu remarquer que expectCalledWith peut être un peu relou
parce qu'on ne peut plus définir de matcher custom pour dire avec quoi on est appelé

pour cette raison je pense qu'il vaut mieux reprendre ce qu'on fait avec
expectThrow et expectResolve par exemple

en gros on va lire la valeur puis on fera then dessus pour faire un expectMatch

expectThrow(() => {
  throw 10
}).then(matchStrict(10))

expectCalledOnce(spy).then(matchArguments(matchStrict(10)))
// sachant que matchArguments lira {argValues} depuis ce qu'on lui passe
// et on aura une version raccourci en
expectCalledOnceWith(spy, matchStrict(10))
// peut aussi s'écrire
expectCalledOnce(spy).then(matchAnyObjectHavingAllowingExtra({
  argValues: [10],
  thisValue: null
}))

// on va retourner deux appels, on en fait quoi?
expectCalledTwice(spy).then(spreadOneMatch(matchArguments(matchStrict(10)))
// avec une version raccouri
expectCalledTwiceWith(spy, matchStrict(10))

expectCalledTwice(spy).then(spreadMatch(
  matchArguments(matchStrict(10)),
  matchArguments(matchStrict(20))
))

*/

export * from "./expectCalled/expectCalled.js"
export * from "./expectCalledExactly/expectCalledExactly.js"
export * from "./expectCalledExactlyWith/expectCalledExactlyWith.js"
export * from "./expectCalledInOrder/expectCalledInOrder.js"
export * from "./expectCalledWith/expectCalledWith.js"
export * from "./expectCalledWithArity/expectCalledWithArity.js"
