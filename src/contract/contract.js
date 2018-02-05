import { passed, failed } from "@dmail/action"
import { hasTalent, mixin } from "@dmail/mixin"

export const contractTalent = () => {
	const map = (actual) => actual

	const validate = ({ actual, expected }) => {
		return actual === expected ? passed() : failed()
	}

	const nextContracts = []
	const expect = function(contract) {
		const self = this
		nextContracts.push(contract)
		return self
	}

	const execute = function(value) {
		const self = this
		const actual = self.map(value, self)
		const execution = mixin(self, () => ({ value, actual }))

		return self.validate(execution).then(() => {
			let lastExecution = execution
			let index = 0
			const iterate = () => {
				if (index === nextContracts.length) {
					return lastExecution
				}
				const nextContract = nextContracts[index]
				index++
				const chainedContract = mixin(nextContract, () => ({ previous: lastExecution }))
				return chainedContract.execute(value).then((execution) => {
					lastExecution = execution
					return iterate()
				})
			}

			return iterate()
		}, () => execution)
	}

	return {
		map,
		validate,
		expect,
		execute,
	}
}

export const isContract = (value) => hasTalent(contractTalent, value)
