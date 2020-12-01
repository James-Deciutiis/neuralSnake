import { SNAKE_SPEED, Snake } from './snake.js'
import { update as updateFood, draw as drawFood, getRandomFoodPosition, getFoodPosition } from './food.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { trainGeneration, findObstacles, findFoodDirection, eatFoodDirection, avoidObstacleDirection, normalizeInput, convertToCardinal, deadPosition } from './trainingData.js' 
import { evolve } from './snakeGenetics.js'
import { plot } from './plot.js'

const THRESHOLD = 0.05
const gameBoard = document.getElementById('game-board')
const automation_btn = document.getElementById("automation_btn")
const manual_btn = document.getElementById("manual_btn")
const return_btn = document.getElementById("return_btn")
const score = document.getElementById("score")
const time = document.getElementById("time")
const chart = document.getElementById('chart')

let lastRenderTime = 0
let lastGenerationTime = 0
let deadCount = 0
let generationNumber = 0
let snakes = []
let maxFitness = [0]
let generationAxis = [0]
let gameOver = false
let automatic_mode = false
let mode_select = true

menu()

function main(currentTime){
	window.requestAnimationFrame(main)
	const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000
	if (secondsSinceLastRender < 1 / SNAKE_SPEED) return

	if(gameOver){
		if(confirm('You lose, press okay to restart')){
			gameOver = false
			snakes[0].restartPlayer()
		}
		else{
			snakes = []
			gameOver = false
			menu()
		}
	}
	
	if(snakes.length > 0){
		lastRenderTime = currentTime
		update()
		draw()
	}
}

function update(){
	if(automatic_mode){
		for(let i = 0; i < snakes.length; i++){
			if(checkLoss(snakes[i]) && !(snakes[i].dead)){
				snakes[i].dead = true
				deadCount += 1
				snakes[i].fitness = (Date.now()/1000) - lastGenerationTime	
			}

			//check to see if all the snakes are dead or if a minute has passed (to prevent endless loops)
			if(deadCount >= snakes.length || (Date.now()/1000) - lastGenerationTime >= 60){	
				snakes[i].fitness = (Date.now()/1000) - lastGenerationTime	
				snakes = evolve(snakes)
				deadCount = 0
				
				for(let k = 0; k<snakes.length; k++){


					console.log("k: " + k + " ele: " + snakes[k].elementId)
			
				}
				//record and plot the new max fitness
				generationNumber++
				maxFitness.push(snakes[0].fitness)
				generationAxis.push(generationNumber)
				while(maxFitness.length > 5){
					maxFitness.shift()
					generationAxis.shift()
				}
				plot(generationAxis, maxFitness)

				lastGenerationTime = Date.now()/1000
				break
			}

			updateFood(snakes[i])
			snakes[i].update()
			autoMove(snakes[i].brain, snakes[i])
			time.innerHTML = "Time left for generation: " + (Math.floor(Math.abs((Date.now()/1000) - lastGenerationTime - 60))).toString()
		}
	}
	else{
		updateFood(snakes[0])
		snakes[0].update()
		move()
		score.innerHTML = "Score : " + (snakes[0].snakeBody.length - 1).toString()
		gameOver = checkLoss(snakes[0])
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

	//console.log("direction to live: " + obstacleAvoidDirection)	
	
	let isObstacle = (obstacleAvoidDirection != 0) ? 1 : 0

	let prediction = nn.feedForward(normalizeInput(north_food, east_food, south_food, west_food, north_obstacle, east_obstacle, south_obstacle, west_obstacle, isObstacle, prevDirection)).data
	let max = 0.0
	let choice = -1

	for(let i = 0; i <= 3; i++){
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

	snake.inputDirection = prediction
}

function move(){
	window.addEventListener('keydown', e => {
		switch(e.key){
			case 'ArrowUp':
				if (snakes[0].lastInputDirection.y !== 0) break
				snakes[0].inputDirection = { x:0, y:-1}
				break
			case 'ArrowRight':
				if (snakes[0].lastInputDirection.x !== 0) break
				snakes[0].inputDirection = { x:1, y:0}
				break
			case 'ArrowLeft':
				if (snakes[0].lastInputDirection.x !== 0) break
				snakes[0].inputDirection = { x:-1, y:0}
				break
			case 'ArrowDown':
				if (snakes[0].lastInputDirection.y !== 0) break
				snakes[0].inputDirection = { x:0, y:1}
				break
		}
	})
}

function menu(){
	automation_btn.style.display = "block"  
	manual_btn.style.display = "block"
	return_btn.style.display = "none"
	gameBoard.style.display = "none"  
	score.style.display = "none"
	chart.style.display = "none"  
	time.style.display = "none"

	automation_btn.onclick = function(){
		automation_btn.style.display = "none"  
		manual_btn.style.display = "none"  
		gameBoard.style.display = "grid"  
		return_btn.style.display = "block"
		chart.style.display = "block"  
		time.style.display = "block"
		mode_select = false
		automatic_mode = true
		start()
	}

	manual_btn.onclick = function(){
		automation_btn.style.display = "none"  
		manual_btn.style.display = "none"  
		gameBoard.style.display = "grid"  
		return_btn.style.display = "block"
		score.style.display = "block"
		mode_select = false
		automatic_mode = false
		start()
	}

	return_btn.onclick = function(){
		snakes = []
		generationNumber = 0
		maxFitness = [0]
		generationAxis = [0]
		menu()
	}
}

function start(){
	if(automatic_mode){
		lastGenerationTime = Date.now()/1000
		snakes = trainGeneration()
		plot([0], [0])
	}
	else{
		let player = new Snake(false, "player")
		snakes.push(player)
	}

	window.requestAnimationFrame(main)
}

