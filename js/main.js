const node = function (x, y, id, wall) {
	this.x = x
	this.y = y
	this.id = id
	this.wall = wall
	this.visited = false
	this.neighbors = []
}

let gridStart, gridEnd, scale

function createGrid(w, h, s) {
	const grid = []
	for (let i = 0; i < h; i += s) {
	  const row = []
		for (j = 0; j < w; j += s)
			row.push(new node(i, j, i / s * w / s + j / s, Math.random() < 0.2))
		grid.push(row)
	}
	return grid
}

function drawGrid(c, grid, s) {
	c.clearRect(0, 0, grid[0].length * s, grid.length * s)
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			c.fillStyle = grid[i][j].wall ? "black" : "white"
			c.fillRect(grid[i][j].y, grid[i][j].x, s, s)
			c.strokeRect(grid[i][j].y, grid[i][j].x, s, s)
		}
	}
}

function addNeighbors(grid) {
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[i].length; j++) {
			if (i >= 0 && i < grid.length - 1 && !grid[i + 1][j].wall)
				grid[i][j].neighbors.push(grid[i + 1][j])
			if (i > 0 && i <= grid.length - 1 && !grid[i - 1][j].wall)
				grid[i][j].neighbors.push(grid[i - 1][j])
			if (j >= 0 && j < grid[i].length - 1 && !grid[i][j + 1].wall)
				grid[i][j].neighbors.push(grid[i][j + 1])
			if (j > 0 && j <= grid[i].length - 1 && !grid[i][j - 1].wall)
				grid[i][j].neighbors.push(grid[i][j - 1])
		}
	}
}

function resetGrid(grid) {
	for (let i = 0; i < grid.length; i++)
		for (let j = 0; j < grid[0].length; j++)
			grid[i][j].visited = false
}

function getPos(e) {
	e.preventDefault()
	let x, y
	let rect = canvas.getBoundingClientRect()
	if (e.touches) {
		x = e.targetTouches[0].pageX - rect.left
		y = e.targetTouches[0].pageY - rect.top
	} else {
		x = e.offsetX * canvas.width / rect.width
		y = e.offsetY * canvas.height / rect.height
	}
	x /= scale
	y /= scale
	return { x, y }
}

function init() {
	const s = 32
	const canvas = document.getElementById("canvas")
	scale = devicePixelRatio
	const w = parseInt(innerWidth / s) * s
	const h = parseInt(innerHeight / s) * s
	canvas.width = w * scale
	canvas.height = h * scale
	canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
	canvas.addEventListener("click", function (e) {
		const pos = getPos(e)
		const x = parseInt(pos.x / s)
		const y = parseInt(pos.y / s)
		if (!grid[y][x] || grid[y][x].wall) return
		if (!gridStart) {
			gridStart = grid[y][x]
		} else if (gridStart && !gridEnd) {
			gridEnd = grid[y][x]
			const path = breadthFirstSearch(c, grid, s, gridStart, gridEnd)
			if (!path) {
				gridStart = gridEnd = null
				resetGrid(grid)
				drawGrid(c, grid, s)
			} else {
				const final_path = []
				let start = gridEnd.id
				const end = gridStart.id
				while (start != end) {
					final_path.unshift(start)
					start = path[start]
				}
				final_path.unshift(end)
				c.fillStyle = "red"
				for (let i = 0; i < final_path.length; i++) {
					const x = parseInt(final_path[i] / (w / s))
					const y = final_path[i] % (w / s)
					c.fillRect(y * s, x * s, s, s)
				}
			}
		} else {
			gridEnd = null
			resetGrid(grid)
			drawGrid(c, grid, s)
			gridStart = grid[y][x]
		}
		if (gridStart) {
			c.fillStyle = "green"
			c.fillRect(gridStart.y, gridStart.x, s, s)
		}
		if (gridEnd) {
			c.fillStyle = "blue"
			c.fillRect(gridEnd.y, gridEnd.x, s, s)
		}
	})
	const c = canvas.getContext('2d')
	c.scale(scale, scale)
	const grid = createGrid(w, h, s)
	drawGrid(c, grid, s)
	addNeighbors(grid)
}


function breadthFirstSearch(c, grid, s, start, end) {
	const stack = [], path = {}
	stack.push(start)
	while (stack.length > 0) {
		v = stack.shift()
		if (v == end) return path
		for (let i = 0; i < v.neighbors.length; i++) {
			if (v.neighbors[i].visited) continue
			v.neighbors[i].visited = true
			path[v.neighbors[i].id] = v.id
			stack.push(v.neighbors[i])
		}
	}
	return null
}

window.onLoad = init()
