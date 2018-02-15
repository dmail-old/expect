import { createDepthFirstIterator, mapDepthFirst } from "./tree.js"
import { test } from "@dmail/test"
import assert from "assert"

test(() => {
	const root = {
		children: ["a", "b"],
	}

	const { next } = createDepthFirstIterator(root)

	assert.deepEqual(next().value, { node: root, ancestors: [] })
	assert.deepEqual(next().value, { node: "a", ancestors: [root] })
	assert.deepEqual(next().value, { node: "b", ancestors: [root] })
	assert.deepEqual(next(), { value: undefined, done: true })
})

test(() => {
	const a = {}
	const b = {}
	const c = {}
	const d = {}
	const e = {}
	const f = {}
	b.children = [c, d]
	d.children = [e]
	const root = {
		children: [a, b, f],
	}

	const { next } = createDepthFirstIterator(root)

	assert.deepEqual(next().value, { node: root, ancestors: [] })
	assert.deepEqual(next().value, { node: a, ancestors: [root] })
	assert.deepEqual(next().value, { node: b, ancestors: [root] })
	assert.deepEqual(next().value, { node: c, ancestors: [root, b] })
	assert.deepEqual(next().value, { node: d, ancestors: [root, b] })
	assert.deepEqual(next().value, { node: e, ancestors: [root, b, d] })
	assert.deepEqual(next().value, { node: f, ancestors: [root] })
})

test(() => {
	const a = { name: "a" }
	const b = { name: "b" }
	const c = { name: "c" }
	const d = { name: "d" }
	const e = { name: "e" }
	const f = { name: "f" }
	b.children = [c, d, e]
	const root = {
		name: "root",
		children: [a, b, f],
	}

	const mappedRoot = mapDepthFirst(root, ({ node, mappedParent, next }) => {
		if (mappedParent) {
			return next(`${mappedParent.data}-${node.name}`)
		}
		return next(`${node.name}`)
	}).getResult()

	assert.deepEqual(mappedRoot, {
		data: "root",
		children: [
			{
				data: "root-a",
			},
			{
				data: "root-b",
				children: [
					{
						data: "root-b-c",
					},
					{
						data: "root-b-d",
					},
					{
						data: "root-b-e",
					},
				],
			},
			{
				data: "root-f",
			},
		],
	})
})
