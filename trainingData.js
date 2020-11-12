import { createPopulation, evolve } from './snakeGenetics.js'
import { outsideGrid, randomGridPosition, GRID_SIZE } from './grid.js'
import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { Snake } from './snake.js'

const DIRECTION_NONE = 0
const DIRECTION_NORTH = 1
const DIRECTION_NORTH_EAST = 2
const DIRECTION_EAST = 3
const DIRECTION_SOUTH_EAST = 4
const DIRECTION_SOUTH = 5
const DIRECTION_SOUTH_WEST = 6
const DIRECTION_WEST = 7
const DIRECTION_NORTH_WEST = 8
const TRAINING_SESSIONS = 400000
const GENERATION_SIZE = 1

let generation = createPopulation(GENERATION_SIZE)

export function trainGeneration(){
	let snakes = []
	for(let j = 0; j < GENERATION_SIZE; j++){
		snakes.push(new Snake("Snake"+j))
		trainSnake(generation[j], snakes[j])	
		console.log(generation[j].numHidden)
	}

	return {
		generation,
		snakes
	}
}

export function trainSnake(network, snake){
	let foodPosition = randomGridPosition()		
	let snakeHead
	let fx, fy, hx, hy, ox, oy
	let prevDirection = DIRECTION_NORTH
	let prediction
	let obstacleAvoidDirection, foodDirection, obstacles
	let north, east, south, west
	snake.inputDirection = {x:0 , y:-1}

	for(let j = 0; j < TRAINING_SESSIONS; j++){
		snake.update()
		
		if(deadPosition({x:hx , y:hy}, snake)){
			snake.restart()
			snake.inputDirection = {x:0 , y:-1}
			prevDirection = DIRECTION_NORTH
		}
		
		foodPosition = randomGridPosition()
		snakeHead = snake.getSnakeHead()
		obstacles = findObstacles(snake, prevDirection)

		let north_obstacle = obstacles[0]
		let east_obstacle = obstacles[1]
		let south_obstacle = obstacles[2]
		let west_obstacle = obstacles[3]

		fx = foodPosition.x
		fy = foodPosition.y
		hx = snakeHead.x
		hy = snakeHead.y

		foodDirection = findFoodDirection(fx, fy, snake, prevDirection)

		let north_food = foodDirection[0]
		let east_food = foodDirection[1]
		let south_food = foodDirection[2]
		let west_food = foodDirection[3]

		obstacleAvoidDirection = avoidObstacleDirection(north_obstacle, east_obstacle, south_obstacle, west_obstacle, snake, prevDirection)
		let eatDirection = eatFoodDirection(north_food, east_food, south_food, west_food, prevDirection)

		if(eatDirection != DIRECTION_NONE){
			north = isNorth(prevDirection, eatDirection)
			east = isEast(prevDirection, eatDirection)
			south = isSouth(prevDirection, eatDirection)
			west = isWest(prevDirection, eatDirection)
		}
		else{
			north = isNorth(prevDirection, obstacleAvoidDirection)
			east = isEast(prevDirection, obstacleAvoidDirection)
			south = isSouth(prevDirection, obstacleAvoidDirection)
			west = isWest(prevDirection, obstacleAvoidDirection)
		}

		network.train(normalizeInput(hx, hy, north_food, east_food, south_food, west_food, north_obstacle, east_obstacle, south_obstacle, west_obstacle, prevDirection), [north, east, south, west])
		
		if(north){
			prediction = { x: 0 , y: -1 }
		}
		else if(east){
			prediction = { x: 1, y: 0 }
		}
		else if(south){
			prediction = { x: 0, y: 1 }
		}
		else if(west){
			prediction = { x: -1, y: 0 } 
		}
		else{
			prediction = snake.inputDirection
		}
	
		snake.inputDirection = prediction
		prevDirection = getPrevDirection(north, east, south, west)
	}
}

export function findFoodDirection(fx, fy, snake, prevDirection){
	let snakeHead = snake.getSnakeHead()
	let hx = snakeHead.x
	let hy = snakeHead.y
	
	let north = false
	let east = false
	let south = false
	let west = false
	
	//North check 1
	if (hx == fx){
		for(let i = hy-1; i >= 1; i--){
			if(i == fy){
				north = true	
				break
			}
			else if(deadPosition({x:hx, y:i}, snake)){
				break
			}
		}
	}
	
	//East check 3
	if (hy == fy){
		for(let i = hx+1; i < GRID_SIZE; i++){
			if(i == fx){
				east = true
				break
			}
			else if(deadPosition({x: i, y: hy}, snake)){
				break
			}
		}
	}
	
	//South check 5
	if (hx == fx){
		for(let i = hy+1; i < GRID_SIZE; i++){
			if(i == fy){
				south = true
				break
			}
			else if(deadPosition({x: hx, y: i}, snake)){
				break
			}
		}
	}
	
	//West 7
	if (hy == fy){
		for(let i = hx-1; i >= 1; i--){
			if(i == fx){
				west = true
				break
			}
			else if(deadPosition({x: i, y: hy}, snake)){
				break
			}
		}
	}
	
	return [north, east, south, west] 
}

export function eatFoodDirection(north_food, east_food, south_food, west_food, prevDirection){
	if(!north_food && !east_food && !south_food && !west_food){
		return DIRECTION_NONE
	}

	if(north_food && prevDirection != DIRECTION_SOUTH){
		return DIRECTION_NORTH
	}
	
	if(east_food && prevDirection != DIRECTION_WEST){
		return DIRECTION_EAST
	}
	
	if(south_food && prevDirection != DIRECTION_NORTH){
		return DIRECTION_SOUTH
	}
	
	if(west_food && prevDirection != DIRECTION_EAST){
		return DIRECTION_WEST
	}

	return DIRECTION_NONE
}

export function findObstacles(snake, prevDirection){
	let snakeHead = snake.getSnakeHead()
	let hx = snakeHead.x
	let hy = snakeHead.y
	
	let north = false
	let east = false
	let south = false
	let west = false

	//wall or snake north?
	if(deadPosition({x:(hx), y:(hy-1)}, snake)){
		north = true
	}
	
	//wall or snake south?
	if(deadPosition({x:(hx), y:(hy+1)}, snake)){
		south = true
	}
	
	//wall or snake east?
	if(deadPosition({x:(hx+1), y:(hy)}, snake)){
		east = true
	}

	//wall or snake west?
	if(deadPosition({x:(hx-1), y:(hy)}, snake)){
		west = true
	}

	return [north, east, south, west]
}

export function avoidObstacleDirection(north_obstacle, east_obstacle, south_obstacle, west_obstacle, snake, prevDirection){
	let snakeHead = snake.getSnakeHead()
	let hx = snakeHead.x
	let hy = snakeHead.y
	
	if(!north_obstacle && !east_obstacle && !south_obstacle && !west_obstacle){
		return prevDirection
	}

	if(north_obstacle && prevDirection == DIRECTION_NORTH){
		if(west_obstacle){
			return DIRECTION_EAST
		}
		else if(east_obstacle){
			return DIRECTION_WEST
		}

		return DIRECTION_EAST
	}
	
	if(east_obstacle && prevDirection == DIRECTION_EAST){
		if(north_obstacle){
			return DIRECTION_SOUTH
		}
		else if(south_obstacle){
			return DIRECTION_NORTH
		}

		return DIRECTION_NORTH
	}
	
	if(south_obstacle && prevDirection == DIRECTION_SOUTH){
		if(west_obstacle){
			return DIRECTION_EAST
		}
		else if(east_obstacle){
			return DIRECTION_WEST
		}

		return DIRECTION_WEST
	}
	
	if(west_obstacle && prevDirection == DIRECTION_WEST){
		if(north_obstacle){
			return DIRECTION_SOUTH
		}
		else if(south_obstacle){
			return DIRECTION_NORTH
		}

		return DIRECTION_SOUTH
	}
	
	return prevDirection
}

function deadPosition(pos, snake){
	return snake.onSnake({x:pos.x, y:pos.y}) || outsideGrid({x:pos.x, y:pos.y})
}

export function normalizeInput(hx, hy, north_food, east_food, south_food, west_food, north_obstacle, east_obstacle, south_obstacle, west_obstacle, prevDirection){
	let retval = []
	retval[0] = (hx - 1) / (GRID_SIZE - 1)
	retval[1] = (hy - 1) / (GRID_SIZE - 1)
	retval[2] = (north_food)
	retval[3] = (east_food)
	retval[4] = (south_food)
	retval[5] = (west_food)
	retval[6] = (north_obstacle)
	retval[7] = (east_obstacle)
	retval[8] = (south_obstacle)
	retval[9] = (west_obstacle)
	retval[10] = (prevDirection) / (7)
	
	return retval
}

function isNorth(prevDirection, direction){
	if(prevDirection == DIRECTION_SOUTH){
		return false
	}

	return direction == DIRECTION_NORTH || direction ==  DIRECTION_NORTH_EAST || direction == DIRECTION_NORTH_WEST
}

function isEast(prevDirection, direction){
	if(prevDirection == DIRECTION_WEST){
		return false
	}
	return direction == DIRECTION_EAST || direction == DIRECTION_NORTH_EAST || direction == DIRECTION_SOUTH_EAST 
}

function isSouth(prevDirection, direction){
	if(prevDirection == DIRECTION_NORTH){
		return false
	}

	return direction == DIRECTION_SOUTH || direction == DIRECTION_SOUTH_EAST || direction == DIRECTION_SOUTH_WEST 
}

function isWest(prevDirection, direction){
	if(prevDirection == DIRECTION_EAST){
		return false
	}

	return direction  == DIRECTION_WEST || direction == DIRECTION_SOUTH_WEST || direction == DIRECTION_NORTH_WEST 
}

function getPrevDirection(north, east, south, west, prevDirection){
	if(north){
		return DIRECTION_NORTH
	}
	if(east){
		return DIRECTION_EAST
	}
	if(south){
		return DIRECTION_SOUTH
	}
	if(west){
		return DIRECTION_WEST
	}

	return prevDirection
}
