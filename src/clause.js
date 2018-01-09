import { mixin, pure, createFactory, isComposedOf } from "@dmail/mixin"
import { passed, failed } from "@dmail/action"

export const pureClause = mixin(pure, () => {
  const createValueDescription = () => 'value'
  const createExpectedDescription = () => uneval(expected)
	const createActualDescription = ({ actual }) => uneval(actual)
	const createFailureDescription = (param) => {
    return `${createValueDescription(param)} mismatch
actual:
${createActualDescription(param)}

expected:
${createExpectedDescription(param)}
`

  const control = (actual, controller) => {
    return passed(controller()).then(
      () => {

      },
      () => {

      }
    )
  }

  const assert = (actual) => {
    return control(actual)
  }

  return { control }
})

export const isClause = (value) => isComposedOf(pureClause, value)
