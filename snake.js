import { GRID_SIZE } from './grid.js'

export const SNAKE_SPEED = 10
export const AUTOMATIC_MODE = true

export class Snake{
	constructor(id){
		this._elementId = id
		this._color = getRandomColor()
		this._snakeBody = getStartPosition()
		//by default, snake is moving in a random direction 
		this._inputDirection = getRandomDirection()
		this._lastInputDirection = this._inputDirection
		this._newSegments = 0
		this._fitness = this._snakeBody.length
		this._dead = false
		if(AUTOMATIC_MODE){
			this._brain = [] 
		}
	}

	update(){
		if(this._dead){return}
		this.addSegments()
		for(let i = this._snakeBody.length - 2; i>=0; i--){
			this._snakeBody[i + 1] = { ...this._snakeBody[i] }
		}

		this._snakeBody[0].x += this._inputDirection.x
		this._snakeBody[0].y += this._inputDirection.y
	}

	draw(gameBoard){
		if(this._dead){return}
		var element = document.createElement("style")
		this._snakeBody.forEach(segment => {
			const snakeElement = document.createElement('div')
			snakeElement.setAttribute("id", this._elementId)
			snakeElement.setAttribute("style", "background-color:"+this._color+"; border: .50vmin solid black;")
			snakeElement.style.gridRowStart = segment.y
			snakeElement.style.gridColumnStart = segment.x
			gameBoard.appendChild(snakeElement)
		})
	}

	expandSnake(amount) {
		this._newSegments += amount
	}

	onSnake(position, { ignoreHead = false } = {} ){
		if(this._dead){return}
		return this._snakeBody.some((segment, index) => {
			if (ignoreHead && index == 0) return false
			return this.equalPositions(segment, position)
		})
	}

	getSnakeHead(){
		return this._snakeBody[0]
	}
	
	snakeIntersection(){
		return this.onSnake(this._snakeBody[0], { ignoreHead : true })
	}

	equalPositions(pos1, pos2){
		return pos1.x == pos2.x && pos1.y == pos2.y
	}

	addSegments(){
		for(let i = 0; i < this._newSegments; i++){
			this._snakeBody.push({...this._snakeBody[this._snakeBody.length - 1]})
		}

		this._newSegments = 0
	}
	
	restart(){
		this._snakeBody = getStartPosition()
		this._dead = false
		this._fitness = 0
		this._inputDirection = getRandomDirection()
		this._lastInputDirection = this._inputDirection
	}


	get inputDirection(){
		return this._inputDirection
	}

	get lastInputDirection(){
		return this._lastInputDirection
	}

	get fitness(){
		return this._fitness
	}

	get dead(){
		return this._dead
	}

	get elementId(){
		return this._elementId
	}
	
	get brain(){
		return this._brain
	}

	set brain(brain){
		this._brain = brain
	}

	set dead(bool){
		this._dead = bool
	}
	
	set inputDirection(input){
		this._lastInputDirection = this._inputDirection
		this._inputDirection = input
	}

	set fitness(score){
		this._fitness = (score *.3 + this._snakeBody.length *.7)
	}
}

function getRandomColor() {
	let letters = '0123456789ABCDEF';
  	let color = '#';
  	for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
  	}
	
	return color;
}

function getRandomDirection(){
	let random = Math.floor(Math.random() * 4) + 1 
	if(random == 1){
		return {x:0, y:-1}
	}
	else if(random == 2){
		return {x:1, y:0}
	}
	else if(random == 3){
		return {x:0, y:1}
	}
	else{
		return {x:-1, y:0}
	}
}

function getStartPosition(){			
	return [{ x:Math.floor(Math.random() * GRID_SIZE) + 1, y:Math.floor(Math.random()* GRID_SIZE)+ 1}]
}
