import { createFactory } from "@dmail/mixin"
import { pureContract } from "../contract.js"
import { hasProperty as valueHasProperty } from "../helper.js"

const getValueDescription = ({ expected }) => `${expected} property`

const getActualDescription = ({ actual }) => (actual ? "missing" : "present")

const getExpectedDescription = () => "present"

export const hasProperty = createFactory(pureContract, ({ setValidator }) => {
	setValidator(({ actual, expected }) => {
		return valueHasProperty(actual, expected)
	})

	return { getValueDescription, getActualDescription, getExpectedDescription }
})
