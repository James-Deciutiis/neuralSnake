import { update as updateSnake, draw as drawSnake, SNAKE_SPEED, AUTOMATIC_MODE, getSnakeHead, snakeIntersection, onSnake} from './snake.js'
import { update as updateFood, draw as drawFood, getRandomFoodPosition, getFoodPosition } from './food.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { setInputDirection, getInputDirection } from './input.js'
import { NeuralNetwork } from './snakeNeuralNetwork.js'

let lastRenderTime = 0
let gameOver = false

const gameBoard = document.getElementById('game-board')
let previousDirection = DIRECTION_NONE

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
}

window.requestAnimationFrame(main)

function update(){
	updateFood()
	updateSnake()
	checkLoss()
	
	if(AUTOMATIC_MODE){
	}
}

function draw(){
	gameBoard.innerHTML = ''
	drawFood(gameBoard)
	drawSnake(gameBoard)
}

function checkLoss(){
	gameOver = (outsideGrid(getSnakeHead()) || snakeIntersection())
}
