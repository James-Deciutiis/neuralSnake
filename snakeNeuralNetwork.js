import { Matrix } from './matrix.js'

const DEBUG_MODE = true
const MESSAGE_FREQUENCY = 10000

export class NeuralNetwork{
	constructor(numInputs, numHidden, numOutputs){
		this._hidden = []
		this._inputs = []
		this._numInputs = numInputs
		this._numHidden = numHidden
		this._numOutputs = numOutputs
		this._bias1 = new Matrix(1, this._numHidden)
		this._bias2 = new Matrix(1, this._numOutputs)
		this._weights1 = new Matrix(this._numInputs, this._numHidden)
		this._weights2 = new Matrix(this._numHidden, this._numOutputs)
	
		// initialize weights
		this._bias1.setRandomWeights()
		this._bias2.setRandomWeights()
		this._weights1.setRandomWeights()
		this._weights2.setRandomWeights()

		//for error logging
		this._logCount = MESSAGE_FREQUENCY
	}

	//getters
	get weights1(){
		return this._weights1
	}
	
	get weights2(){
		return this._weights2
	}
	
	get hidden(){
		return this._hidden
	}
	
	get inputs(){
		return this._inputs
	}

	get bias1(){
		return this._bias1
	}
	
	get bias2(){
		return this._bias2
	}

	get logCount(){
		return this._logCount
	}

	//setters
	set weights1(weights){
		this._weights1 = weights
	}

	set weights2(weights){
		this._weights2 = weights
	}
	
	set hidden(hidden){
		this._hidden = hidden
	}
	
	set inputs(inputs){
		this._inputs = inputs
	}
	
	set bias1(bias){
		this._bias1 = bias
	}
	
	set bias2(bias){
		this._bias2 = bias
	}
	
	set logCount(count){
		this._logCount = count
	}

	feedForward(inputArray){
		this.inputs = Matrix.convertFromArray(inputArray)

		this.hidden = Matrix.dotProduct(this.inputs, this.weights1)
		this.hidden = Matrix.addMatrices(this.hidden, this.bias1)
		this.hidden = Matrix.map(this.hidden, x => sigmoid(x))

		let outputs = Matrix.dotProduct(this.hidden, this.weights2)
		outputs = Matrix.addMatrices(outputs, this.bias2)
		outputs = Matrix.map(outputs, x => sigmoid(x))
		
		return outputs
	}

	train(inputArray, targetArray){
		let outputs = this.feedForward(inputArray)
		
		let targets = Matrix.convertFromArray(targetArray)
		let outputErrors = Matrix.subtractMatrices(targets, outputs)
		
		if (DEBUG_MODE){
			if(this.logCount == MESSAGE_FREQUENCY){
				console.log("error: " + outputErrors.data[0][0]);
			}
			this.logCount--;
			if(this.logCount == 0){
				this.logCount = MESSAGE_FREQUENCY
			}
		}

		let outputDerivs = Matrix.map(outputs, x => sigmoid(x, true))
		let outputDeltas = Matrix.multiplyMatrices(outputErrors, outputDerivs)
		
		let weights2T = Matrix.transpose(this.weights2)
		let hiddenErrors = Matrix.dotProduct(outputDeltas, weights2T)
		
		let hiddenDerivs = Matrix.map(this.hidden, x => sigmoid(x, true))
		let hiddenDeltas = Matrix.multiplyMatrices(hiddenErrors, hiddenDerivs)
		
		let inputsT = Matrix.transpose(this.inputs)
		this.weights1 = Matrix.addMatrices(this.weights1, Matrix.dotProduct(inputsT, hiddenDeltas))
		
		let hiddenT = Matrix.transpose(this.hidden)
		this.weights2 = Matrix.addMatrices(this.weights2, Matrix.dotProduct(hiddenT, outputDeltas))
		
		this.bias1 = Matrix.addMatrices(this.bias1, hiddenDeltas)
		this.bias2 = Matrix.addMatrices(this.bias2, outputDeltas)
	}
}

function sigmoid(x, deriv = false){
	if(deriv){
		return x * (1 - x)
	}

	return 1/(1 + Math.exp(-x))
}


/*
for(let i = 0; i < 100000; i++){
	// XOR GATE TEST
	// [0, 0] = 0
	// [0, 1] = 1
	// [1, 0] = 1
	// [1, 1] = 0
	let input1 = Math.round(Math.random())
	let input2 = Math.round(Math.random())
	let output = input1 == input2 ? 0 : 1
	nn.train([input1, input2], [output])
}

console.log("[0, 0] = " + nn.feedForward([0,0]).data)
console.log("[0, 1] = " + nn.feedForward([0,1]).data)
console.log("[1, 0] = " + nn.feedForward([1,0]).data)
console.log("[1, 1] = " + nn.feedForward([1,1]).data)
*/ 
