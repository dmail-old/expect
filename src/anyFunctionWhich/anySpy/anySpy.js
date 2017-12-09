import { any } from "../any/any.js"

// for now thers is "no way" to differentiate spy from other regular object
// it may change in the future but for now, anything can be considered as a spy object/function
export const anySpy = () => any(Function).then(null, () => any(Object))
