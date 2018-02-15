import { createAction } from "@dmail/action"

// https://code.tutsplus.com/articles/data-structures-with-javascript-tree--cms-23393

const getChildren = (node) => {
	if (typeof node !== "object") {
		return []
	}

	if ("children" in node === false) {
		return []
	}

	return node.children
}

const getNextSibling = (node, parent) => {
	const children = getChildren(parent)
	return children[children.indexOf(node) + 1]
}

export const createDepthFirstIterator = (rootNode) => {
	let neverCalled = true
	let node
	let ancestors

	const getNextValue = () => {
		if (neverCalled) {
			neverCalled = false
			ancestors = []
			node = rootNode
			return { node, ancestors }
		}

		const children = getChildren(node)
		const firstChild = children[0]
		if (firstChild) {
			ancestors.push(node)
			node = firstChild
			return { node, ancestors }
		}

		let child = node
		while (ancestors.length) {
			const ancestor = ancestors[ancestors.length - 1]
			const nextSibling = getNextSibling(child, ancestor)
			if (nextSibling) {
				node = nextSibling
				return { node, ancestors }
			}
			ancestors.pop()
			child = ancestor
		}

		node = null
		return { node, ancestors }
	}

	const next = (data) => {
		const value = getNextValue(data)
		if (value.node) {
			return { value, done: false }
		}
		return { value: undefined, done: true }
	}

	return { next }
}

export const getRootNode = ({ node, ancestors }) => (ancestors.length === 0 ? node : ancestors[0])

export const mapDepthFirst = (rootNode, map) => {
	const { next: iterate } = createDepthFirstIterator(rootNode)
	let mappedNode
	let mappedAncestors
	const action = createAction()

	const stop = (result) => {
		mappedNode.data = result
		action.pass(getRootNode({ node: mappedNode, ancestors: mappedAncestors }))
	}

	const visit = () => {
		const { value, done } = iterate()

		if (done) {
			action.pass(getRootNode({ node: mappedNode, ancestors: mappedAncestors }))
			return
		}

		const { node, ancestors } = value

		let parent
		let mappedParent
		let index

		if (ancestors.length === 0) {
			// node is the root node
			mappedAncestors = []
			parent = null
			mappedParent = null
			mappedNode = {}
		} else if (ancestors[ancestors.length - 1].children[0] === node) {
			// node is the first child of the previous one
			mappedAncestors.push(mappedNode)
			parent = ancestors[ancestors.length - 1]
			mappedParent = mappedNode
			index = 0
			mappedNode = {}
			mappedParent.children = [mappedNode]
		} else if (ancestors.length === mappedAncestors.length) {
			// node is the next sibling of the previous
			parent = ancestors[ancestors.length - 1]
			mappedParent = mappedAncestors[mappedAncestors.length - 1]
			index = mappedParent.children.length
			mappedNode = {}
			mappedParent.children[index] = mappedNode
		} else {
			// node is the next sibling of something
			mappedAncestors.length = ancestors.length
			parent = ancestors[ancestors.length - 1]
			mappedParent = mappedAncestors[mappedAncestors.length - 1]
			index = mappedParent.children.length
			mappedNode = {}
			mappedParent.children[index] = mappedNode
		}

		const next = (result) => {
			mappedNode.data = result
			visit()
		}

		map({
			node,
			index,
			stop,
			next,
			ancestors,
			parent,
			mappedAncestors,
			mappedParent,
		})
	}
	visit()

	return action
}

// export const createBreadthFirstIterator = (rootNode) => {}
