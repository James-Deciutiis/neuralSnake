import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { Snake } from './snake.js'
import { Matrix } from './matrix.js'
import { trainSnake } from './trainingData.js'
import { plot } from './plot.js'

const MAX_NUMBER_OF_NEURONS = 100
let generationNumber = 0
let generationAxis = []
let maxFitness = []

export function createPopulation(size){
	let pop = []
	for(let i = 0; i < size; i++){
		let nn = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)   
		let snake = new Snake("Snake_i")
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
	let oldWeights1 = network.weights1
	let oldWeights2 = network.weights2

	let mutation1 = network.weights1.getRandomWeights()
	let mutation2 = network.weights2.getRandomWeights()

	network.weights1 = (oldWeights1 + mutation1)  * .5
	network.weights2 = (oldWeights2 + mutation2)  * .5
}

export function evolve(snakes){
	let newGen = []
	let children = []

	snakes.sort(function(a, b){return Math.abs(b.fitness) - Math.abs(a.fitness)})
	
	maxFitness.push(snakes[0].fitness)
	generationAxis.push(generationNumber)
	plot(generationAxis, maxFitness)

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
			let newsnake = new Snake("Snake_child_"+j+"generation_"+generationNumber)
			newsnake.brain = new NeuralNetwork(10, MAX_NUMBER_OF_NEURONS, 4)   
			newGen.push(newsnake)	
		}
	}
	
	let retVal = snakes.concat(newGen)
	
	//randomly mutate some of the snakes
	for(let i = 0; i < (retVal.length); i++){
		if(Math.floor(Math.random() * 1000) % 5 == 0){
		}

		console.log("test" + retVal[i].brain.numHidden)
		trainSnake(retVal[i].brain, retVal[i])
	}

	generationNumber++

	return retVal
}

