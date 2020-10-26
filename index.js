import { update as updateSnake, draw as drawSnake, SNAKE_SPEED, AUTOMATIC_MODE, getSnakeHead, snakeIntersection, onSnake} from './snake.js'
import { update as updateFood, draw as drawFood, getRandomFoodPosition, getFoodPosition } from './food.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { setInputDirection, getInputDirection } from './input.js'
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

const nn = new NeuralNetwork(6, 50, 4)
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
	let fx, fy, hx, hy, ox, oy
	let obstacleAvoidDirection, foodDirection, obstacle
	let north, east, south, west
	for (let i = 0; i < 5000000; i++){
		foodPosition = randomGridPosition()
		snakeHead = randomGridPosition()
		fx = foodPosition.x
		fy = foodPosition.y
		hx = snakeHead.x
		hy = snakeHead.y
		obstacle = findObstacles(hx, hy)
		ox = obstacle.x
		oy = obstacle.y
		
		foodDirection = findFoodDirection(fx, fy, hx, hy)
		obstacleAvoidDirection = avoidObstacleDirection(ox, oy, hx, hy)

		if(obstacle.x != 0 && obstacle.y != 0){
			north = obstacleAvoidDirection == DIRECTION_NORTH || obstacleAvoidDirection ==  DIRECTION_NORTH_EAST || obstacleAvoidDirection == DIRECTION_NORTH_WEST ? 1 : 0
			east = obstacleAvoidDirection == DIRECTION_EAST || obstacleAvoidDirection == DIRECTION_NORTH_EAST || obstacleAvoidDirection == DIRECTION_SOUTH_EAST ? 1 : 0
			south = obstacleAvoidDirection == DIRECTION_SOUTH || obstacleAvoidDirection == DIRECTION_SOUTH_EAST || obstacleAvoidDirection == DIRECTION_SOUTH_WEST ? 1 : 0
			west = obstacleAvoidDirection  == DIRECTION_WEST || obstacleAvoidDirection == DIRECTION_SOUTH_WEST || obstacleAvoidDirection == DIRECTION_NORTH_WEST ? 1 : 0
		}
		else{
			north = foodDirection == DIRECTION_NORTH || foodDirection ==  DIRECTION_NORTH_EAST || foodDirection == DIRECTION_NORTH_WEST ? 1 : 0
			east = foodDirection == DIRECTION_EAST || foodDirection == DIRECTION_NORTH_EAST || foodDirection == DIRECTION_SOUTH_EAST ? 1 : 0
			south = foodDirection == DIRECTION_SOUTH || foodDirection == DIRECTION_SOUTH_EAST || foodDirection == DIRECTION_SOUTH_WEST ? 1 : 0
			west = foodDirection  == DIRECTION_WEST || foodDirection == DIRECTION_SOUTH_WEST || foodDirection == DIRECTION_NORTH_WEST ? 1 : 0
		}

		nn.train(normalizeInput(fx, fy, hx, hy, ox, oy), [north, east, south, west])
	}
}

window.requestAnimationFrame(main)

function update(){
	updateFood()
	updateSnake()
	checkLoss()
	
	if(AUTOMATIC_MODE){
		let fx = getFoodPosition().x	
		let fy = getFoodPosition().y
		let hx = getSnakeHead().x	
		let hy = getSnakeHead().y	
		let ox = findObstacles(hx, hy).x
		let oy = findObstacles(hx, hy).y

		let obstacleAvoidDirection = avoidObstacleDirection(ox, oy, hx, hy)
		console.log("direction to live: " + obstacleAvoidDirection)	
		let prediction = nn.feedForward(normalizeInput(fx, fy, hx, hy, ox, oy)).data
		
		let max = 0.0
		let choice = 0
		for(let i = 0; i <= 3; i++){
			console.log(prediction[0][i])
			if(max < prediction[0][i]){
				max = prediction[0][i]
				choice = i
			}
		}
		
		if(choice == 0 && getInputDirection().y == 0){
			prediction = { x: 0 , y: -1 }
		}
		else if(choice == 1 && getInputDirection().x == 0){
			prediction = { x: 1, y: 0 }
		}
		else if(choice == 2 && getInputDirection().y == 0){
			prediction = { x: 0, y: 1 }
		}
		else if(choice == 3 && getInputDirection().x == 0){
			prediction = { x: -1, y: 0 } 
		}
		else{
			prediction = getInputDirection()
		}
		console.log("prediction: " + prediction.x + prediction.y)

		setInputDirection(prediction)
	}
}

function draw(){
	gameBoard.innerHTML = ''
	drawFood(gameBoard)
	drawSnake(gameBoard)
}

function findFoodDirection(fx, fy, hx, hy){
	//North check 1
	if (hx == fx){
		for(let i = hy-1; i >= 1; i--){
			if(i == fy){
				return DIRECTION_NORTH	
			}
			else if(onSnake({x:hx, y:i})){
				return DIRECTION_EAST 
			}
		}
	}
	
	//North-east check 2
	for(let i = hx+1, j = hy-1; i < GRID_SIZE, j >= 1; i++, j--){
		if(i == fx && j == fy){
			return DIRECTION_NORTH_EAST
		}
		else if(onSnake({x: i , i: j})){
			return DIRECTION_WEST 
		}
	}

	//East check 3
	if (hy == fy){
		for(let i = hx+1; i < GRID_SIZE; i++){
			if(i == fx){
				return DIRECTION_EAST	
			}
			else if(onSnake({x: i, y: hy})){
				return DIRECTION_EAST 
			}
		}
	}
	
	//South-east check 4
	for(let i = hx+1, j = hy+1; i < GRID_SIZE, j < GRID_SIZE; i++, j++){
		if(i == fx && j == fy){
			return DIRECTION_SOUTH_EAST
		}
		else if(onSnake({x: i , i: j})){
			return DIRECTION_WEST 
		}
	}
	
	//South check 5
	if (hx == fx){
		for(let i = hy+1; i < GRID_SIZE; i++){
			if(i == fy){
				return DIRECTION_SOUTH
			}
			else if(onSnake({x: hx, y: i})){
				return DIRECTION_EAST 
			}
		}
	}
	
	//South-west check 6
	for(let i = hx-1, j = hy+1; i >= 1, j < GRID_SIZE; i--, j++){
		if(i == fx && j == fy){
			return DIRECTION_SOUTH_WEST
		}
		else if(onSnake({x: i , i: j})){
			return DIRECTION_EAST 
		}
	}
	
	//West 7
	if (hy == fy){
		for(let i = hx-1; i >= 1; i--){
			if(i == fx){
				return DIRECTION_WEST	
			}
			else if(onSnake({x: i, y: hy})){
				return DIRECTION_EAST 
			}
		}
	}
	
	//North-west check 8
	for(let i = hx+1, j = hy-1; i >= 1, j >= 1; i++, j--){
		if(i == fx && j == fy){
			return DIRECTION_NORTH_WEST
		}
		else if(onSnake({x: i , i: j})){
			return DIRECTION_EAST 
		}
	}	
	return 0 
}

function findObstacles(hx, hy){
	//wall or snake north?
	if(onSnake({x:(hx), y:(hy-1)}) || outsideGrid({x:(hx), y:(hy-1)})){
		return {x:(hx), y:(hy-1)}
	}
	
	//wall or snake east?
	if(onSnake({x:(hx+1), y:(hy)}) || outsideGrid({x:(hx+1), y:(hy)})){
		return {x:(hx+1), y:(hy)}
	}
	
	//wall or snake south?
	if(onSnake({x:(hx), y:(hy+1)}) || outsideGrid({x:(hx), y:(hy+1)})){
		return {x:(hx), y:(hy+1)}
	}
	
	//wall or snake west?
	if(onSnake({x:(hx-1), y:(hy)}) || outsideGrid({x:(hx-1), y:(hy)})){
		return {x:(hx-1), y:(hy)}
	}

	return {x:0, y:0}
}

function avoidObstacleDirection(ox, oy, hx, hy){
	//obstacle north or south?
	if(ox == hx && (oy == (hy-1)  || oy == (hy+1))){
		//is there a wall or snake east in addition to one being north
		if(onSnake({x:(hx+1), y:(hy)}) || outsideGrid({x:(hx+1), y:(hy)})){
			return DIRECTION_WEST
		}	
		//wall or snake west?
		if(onSnake({x:(hx-1), y:(hy)}) || outsideGrid({x:(hx-1), y:(hy)})){
			return DIRECTION_EAST
		}

		return DIRECTION_EAST
	}
	
	//obstacle east or west?
	if((ox == (hx+1) || ox == (hx-1)) && oy == hy){
		//wall or snake north?
		if(onSnake({x:(hx), y:(hy-1)}) || outsideGrid({x:(hx), y:(hy-1)})){
			return DIRECTION_SOUTH
		}	
		//wall or snake south?
		if(onSnake({x:(hx), y:(hy+1)}) || outsideGrid({x:(hx), y:(hy+1)})){
			return DIRECTION_NORTH
		}
		return DIRECTION_NORTH
	}

	return 0
}

function normalizeInput(fx, fy, hx, hy, ox, oy){
	let retval = []
	retval[0] = (fx - 1) / (GRID_SIZE - 1)
	retval[1] = (hy - 1) / (GRID_SIZE - 1)
	retval[2] = (hx - 1) / (GRID_SIZE - 1)
	retval[3] = (hy - 1) / (GRID_SIZE - 1)
	retval[4] = (ox - 1) / (GRID_SIZE - 1)
	retval[5] = (oy - 1) / (GRID_SIZE - 1)
	
	return retval
}

function normalizeOutput(direction){
	return [(direction - 0)/(8 - 0)]
}

function checkLoss(){
	gameOver = (outsideGrid(getSnakeHead()) || snakeIntersection())
}
