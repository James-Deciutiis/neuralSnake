export const SNAKE_SPEED = 1
export const AUTOMATIC_MODE = true

export class Snake{
	constructor(id){
		this._elementId = id
		this._color = getRandomColor()
		this._snakeBody = getStartPosition()
		this._inputDirection = { x:0, y:0 }
		this._lastInputDirection = this._inputDirection
		this._newSegments = 0
		this._fitness = this._snakeBody.length
		this._dead = false
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
			snakeElement.setAttribute("style", "background-color:"+this._color+";")
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
	
	setSnakeHead(pos){
		this._snakeBody[0].x += pos.x
		this._snakeBody[0].y += pos.y

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
	}

	set inputDirection(input){
		if(this._dead){return}
		this._lastInputDirection = this._inputDirection
		this._inputDirection = input
	}

	set fitness(score){
		this._fitness = (score *.3 + this._snakeBody.length *.7)
	}

	get inputDirection(){
		return this._inputDirection
	}

	get fitness(){
		return this._fitness
	}

	get dead(){
		return this._dead
	}

	set dead(bool){
		this._dead = bool
	}
}


function getRandomColor() {
	var letters = '0123456789ABCDEF';
  	var color = '#';
  	for (var i = 0; i < 6; i++) {
	    color += letters[Math.floor(Math.random() * 16)];
  	}
	
	return color;
}

function getStartPosition(){			
	return [{ x:Math.floor(Math.random() *5) + 1, y:Math.floor(Math.random()*5)+ 1}]
}
