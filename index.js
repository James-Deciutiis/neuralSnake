import { update as updateSnake, draw as drawSnake, SNAKE_SPEED, AUTOMATIC_MODE, getSnakeHead, snakeIntersection } from './snake.js'
import { update as updateFood, draw as drawFood, getRandomFoodPosition, getFoodPosition } from './food.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { setInputDirection } from './input.js'
import { NeuralNetwork } from './snakeNeuralNetwork.js'

let lastRenderTime = 0
let gameOver = false

const DIRECTION_NORTH = 1
const DIRECTION_NORTH_EAST = 2
const DIRECTION_EAST = 3
const DIRECTION_SOUTH_EAST = 4
const DIRECTION_SOUTH = 5
const DIRECTION_SOUTH_WEST = 6
const DIRECTION_WEST = 7
const DIRECTION_NORTH_WEST = 8
const THRESHOLD = 0.25

const nn = new NeuralNetwork(4, 32, 1)
const gameBoard = document.getElementById('game-board')

function main(currentTime){
	window.requestAnimationFrame(main)
	const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
	if (secondsSinceLastRender < 1 / SNAKE_SPEED) return

	if(gameOver){
		if(confirm('You lose, press okay to restart')){
			window.location = '/'
		}
		return 
	}

	lastRenderTime = currentTime

	update()
	draw()
}
	
if(AUTOMATIC_MODE){
	let foodPosition = randomGridPosition()		
	let snakeHead = randomGridPosition()
	let fx, fy, hx, hy
	for (let i = 0; i < 700000; i++){
		foodPosition = randomGridPosition()
		snakeHead = randomGridPosition()
		fx = foodPosition.x
		fy = foodPosition.y
		hx = snakeHead.x
		hy = snakeHead.y
		
		let direction = findFoodDirection(fx, fy, hx, hy)	
		nn.train(normalizeInput(fx, fy, hx, hy), [direction])
	}
	
	let prediction = nn.feedForward([11, 12, 11, 11]).data[0][0]
		
	console.log("prediction: " + prediction)
	console.log("should be: " + findFoodDirection(11,12,11,11))
}

window.requestAnimationFrame(main)

function update(){
	if(AUTOMATIC_MODE){
		let fx = getFoodPosition().x	
		let fy = getFoodPosition().y
		let hx = getSnakeHead().x	
		let hy = getSnakeHead().y	
		
	}
	updateFood()
	updateSnake()
	checkLoss()
}

function draw(){
	gameBoard.innerHTML = ''
	drawFood(gameBoard)
	drawSnake(gameBoard)
}

function findFoodDirection(fx, fy, hx, hy){
	//North check 1
	if (hx == fx){
		for(let i = hy; i >= 1; i--){
			if(i == fy){
				return 1	
			}
		}
	}
	
	//North-east check 2
	for(let i = hx, j = hy; i < GRID_SIZE, j >= 1; i++, j--){
		if(i == fx && j == fy){
			return 2
		}
	}

	//East check 3
	if (hy == fy){
		for(let i = hx; i < GRID_SIZE; i++){
			if(i == fx){
				return 3	
			}
		}
	}
	
	//South-east check 4
	for(let i = hx, j = hy; i < GRID_SIZE, j < GRID_SIZE; i++, j++){
		if(i == fx && j == fy){
			return 4
		}
	}
	
	//South check 5
	if (hx == fx){
		for(let i = hy; i < GRID_SIZE; i++){
			if(i == fy){
				return 5	
			}
		}
	}
	
	//South-west check 6
	for(let i = hx, j = hy; i >= 1, j < GRID_SIZE; i--, j++){
		if(i == fx && j == fy){
			return 6
		}
	}
	
	//West 7
	if (hy == fy){
		for(let i = hx; i >= 1; i--){
			if(i == fx){
				return 7	
			}
		}
	}
	
	//North-west check 8
	for(let i = hx, j = hy; i >= 1, j >= 1; i++, j--){
		if(i == fx && j == fy){
			return 8
		}
	}	
	
	return 0 
}

function normalizeInput(fx, fy, hx, hy){
	let retval = []
	retval[0] = (fx - 1) / (GRID_SIZE - 1)
	retval[1] = (hy - 1) / (GRID_SIZE - 1)
	retval[2] = (hx - 1) / (GRID_SIZE - 1)
	retval[3] = (hy - 1) / (GRID_SIZE - 1)

	return retval
}

function normalizeOutput(direction){
	return [(direction - 0)/(8 - 0)]
}

function checkLoss(){
	gameOver = (outsideGrid(getSnakeHead()) || snakeIntersection())
}