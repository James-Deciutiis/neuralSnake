import { Snake } from './snake.js' 
import { randomGridPosition } from './grid.js'

let food = {
	x: 4,
	y: 3
}
const EXPANSION_RATE = 1
export function update(snake){
	if(snake.onSnake(food)){
		snake.expandSnake(EXPANSION_RATE)
		food = getRandomFoodPosition(snake)
	}
}

export function draw(gameBoard){
	const foodElement = document.createElement('div')
	foodElement.style.gridRowStart = food.y
	foodElement.style.gridColumnStart = food.x
	foodElement.classList.add('food')
	gameBoard.appendChild(foodElement)
}

export function getRandomFoodPosition(snake){
	let newFoodPosition
	while(newFoodPosition == null || snake.onSnake(newFoodPosition)){
		newFoodPosition = randomGridPosition()
	}
	return newFoodPosition
}

export function getFoodPosition(){
	return food
}
