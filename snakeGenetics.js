import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { Snake } from './snake.js'
import { Matrix } from './matrix.js'
import { trainSnake } from './trainingData.js'
import { plot } from './plot.js'

const MAX_NUMBER_OF_NEURONS = 100
let generationNumber = 1
let generationAxis = [0]
let maxFitness = [0]

export function createPopulation(size){
	let pop = []
	for(let i = 0; i < size; i++){
		let nn = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)   
		let snake = new Snake(true, "Snake_i")
		snake.brain = nn
		pop.push(snake)
	}
	
	return pop
}

function breed(mother, father){
	let children = []
	for(let i = 0; i < 2; i++){
		let child = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)
		child.weights1 = father.weights1
		child.weights2 = mother.weights2
		children.push(child)
	}
	
	return children
}

function mutate(network){
	let temp = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)
	let mutation1 =	temp.weights1
	let mutation2 = temp.weights2
	
	network.weights1 = Matrix.averageMatrices(mutation1, network.weights1)
	network.weights2 = Matrix.averageMatrices(mutation2, network.weights2)
}

export function evolve(snakes){
	let newGen = []
	let children = []

	snakes.sort(function(a, b){return Math.abs(b.fitness) - Math.abs(a.fitness)})
	
	//remove everything but the best 2 snakes
	while(snakes.length > 3){
		snakes.pop()
	}
	
	for(let i = 0; i < snakes.length; i++){
		snakes[i].restart()
	}
	
	for(let k = 0; k < snakes.length; k++){
		let dad = snakes[1].brain
		let mom = snakes[0].brain
		children = breed(mom, dad)	

		for(let j = 0; j < children.length; j++){
			let newsnake = new Snake(true, "Snake_child_"+j+"generation_"+generationNumber)
			newsnake.brain = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)   
			newGen.push(newsnake)	
		}
	}
	
	let retval = snakes.concat(newGen)
	
	//randomly mutate some of the snakes
	for(let i = 0; i < (retval.length); i++){
		if(Math.floor(Math.random() * 10) == 3){
			mutate(retval[i].brain)
		}

		console.log("test" + retval[i].brain.numHidden)
		trainSnake(retval[i].brain, retval[i])
	}

	generationNumber++

	return retval
}

