export const limitLines = ({ createIntro = () => "", getLines, createLine, maxLines = 3 }) => {
	const createMessage = (param) => {
		let message = createIntro(param)

		const lines = getLines(param)
		const lineCount = lines.length
		const truncatedCount = lineCount - maxLines
		const truncatedLines = lines.slice(0, maxLines)

		if (truncatedLines.length) {
			message += ":\n"
			truncatedLines.forEach((line, index) => {
				message += createLine(line)
				if (index + 1 < truncatedLines.length) {
					message += "\n\n"
				}
			})
		}

		if (truncatedCount > 0) {
			message += `and ${truncatedCount} more`
		}

		return message
	}
	return createMessage
}
