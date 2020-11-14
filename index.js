import { SNAKE_SPEED, AUTOMATIC_MODE, Snake } from './snake.js'
import { update as updateFood, draw as drawFood, getRandomFoodPosition, getFoodPosition } from './food.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { trainGeneration, findObstacles, findFoodDirection, eatFoodDirection, avoidObstacleDirection, normalizeInput, convertToCardinal, deadPosition } from './trainingData.js' 
import { evolve } from './snakeGenetics.js'

let lastRenderTime = 0
let deadCount = 0
let gameOver = false
let nn = []
let snakes = []
let lastGenerationTime = 0
const THRESHOLD = 0.05
const gameBoard = document.getElementById('game-board')

if(AUTOMATIC_MODE){
	let data = trainGeneration()
	nn = data.generation
	snakes = data.snakes
	for(let i = 0; i < snakes.length; i++){
		console.log(snakes[i])
		snakes[i].inputDirection = {x:0 , y:-1}
	}
	lastGenerationTime = Date.now()/1000
}
else{
	let human = new Snake()
	snakes.push(human)
}

function main(currentTime){
	window.requestAnimationFrame(main)
	const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
	if (secondsSinceLastRender < 1 / SNAKE_SPEED) return

	if(false){
		if(confirm('You lose, press okay to restart')){
			window.location = '/'
		}
		return 
	}

	lastRenderTime = currentTime
	update()
	draw()
}
	
window.requestAnimationFrame(main)

function update(){
	if(AUTOMATIC_MODE){
		for(let i = 0; i < snakes.length; i++){
			if(checkLoss(snakes[i]) && !(snakes[i].dead)){
				snakes[i].dead = true
				deadCount += 1
				snakes[i].fitness = (Date.now()/1000) - lastGenerationTime	
			}
			if(deadCount >= snakes.length || (Date.now()/1000) - lastGenerationTime > 60){	
				snakes[i].fitness = (Date.now()/1000) - lastGenerationTime	

				let data = evolve(nn, snakes)
				nn = data.retVal
				snakes = data.snakes
				deadCount = 0
				lastGenerationTime = Date.now()/1000
				break
			}
			updateFood(snakes[i])
			snakes[i].update()
			autoMove(nn[i], snakes[i])
		}
	}
	else{
		updateFood(snakes[0])
		snakes[0].update()
		checkLoss()
	}
}

function draw(){
	gameBoard.innerHTML = ''
	drawFood(gameBoard)
	for(let i = 0; i < snakes.length; i++){
		snakes[i].draw(gameBoard)
	}
}

function checkLoss(snake){
	return (outsideGrid(snake.getSnakeHead()) || snake.snakeIntersection())
}

function autoMove(nn, snake){
	let foodPosition = getFoodPosition()
	let snakeHead = snake.getSnakeHead()
	let fx = foodPosition.x	
	let fy = foodPosition.y
	let hx = snakeHead.x
	let hy = snakeHead.y
		
	let prevDirection = convertToCardinal(snake.lastInputDirection)

	let obstacles = findObstacles(snake, prevDirection)

	let north_obstacle = obstacles[0]
	let east_obstacle = obstacles[1]
	let south_obstacle = obstacles[2]
	let west_obstacle = obstacles[3]
		
	let foodDirection = findFoodDirection(fx, fy, snake, prevDirection)

	let north_food = foodDirection[0]
	let east_food = foodDirection[1]
	let south_food = foodDirection[2]
	let west_food = foodDirection[3]

	let obstacleAvoidDirection = avoidObstacleDirection(north_obstacle, east_obstacle, south_obstacle, west_obstacle, snake, prevDirection)
	console.log("direction to live: " + obstacleAvoidDirection)	
	let isObstacle = (obstacleAvoidDirection != 0) ? 1 : 0

	let prediction = nn.feedForward(normalizeInput(north_food, east_food, south_food, west_food, north_obstacle, east_obstacle, south_obstacle, west_obstacle, isObstacle, prevDirection)).data
	let max = 0.0
	let choice = -1


	for(let i = 0; i <= 3; i++){
		console.log(prediction[0][i])
		if(max < prediction[0][i] && (prediction[0][i] - THRESHOLD > 0)){
			max = prediction[0][i]
			choice = i
		}
	}
	
	if(choice == 0 && snake.inputDirection.y == 0){
		prediction = { x: 0 , y: -1 }
		prevDirection = 1
	}
	else if(choice == 1 && snake.inputDirection.x == 0){
		prediction = { x: 1, y: 0 }
		prevDirection = 3
	}
	else if(choice == 2 && snake.inputDirection.y == 0){
		prediction = { x: 0, y: 1 }
		prevDirection = 5
	}
	else if(choice == 3 && snake.inputDirection.x == 0){
		prediction = { x: -1, y: 0 } 
		prevDirection = 7
	}
	else{
		prediction = snake.inputDirection
	}
	
	console.log("prediction is " + prediction.x + prediction.y)
	snake.inputDirection = prediction
}

