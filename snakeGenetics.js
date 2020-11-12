import { NeuralNetwork } from './snakeNeuralNetwork.js'
import { Snake } from './snake.js'
import { Matrix } from './matrix.js'
import { trainSnake } from './trainingData.js'

const MAX_NUMBER_OF_NEURONS = 32

export function createPopulation(size){
	let pop = []
	for(let i = 0; i < size; i++){
		let nn = new NeuralNetwork(11, MAX_NUMBER_OF_NEURONS, 4)   
		pop.push(nn)
	}
	
	return pop
}

function breed(mother, father){
	let children = []
	for(let i = 0; i < 2; i++){
		let child = new NeuralNetwork(11, MAX_NUMBER_OF_NEURONS, 4)
		child.weights1 = father.weights1
		child.weights2 = mother.weights2
		children.push(child)
	}
	
	return children
}

function mutate(network){
	network.weights1.setRandomWeights()
	network.weights2.setRandomWeights()
}

export function evolve(pop, snakes){
	let newGen = []
	let children = []

	for(let i = 0; i < snakes.length; i++){
		pop[i].score = snakes[i].fitness
		console.log("fitness : " + snakes[i].fitness)
	}

	snakes.sort(function(a, b){return Math.abs(b.fitness) - Math.abs(a.fitness)})
	pop.sort(function(a, b){return Math.abs(b.score) - Math.abs(a.score)})

	//remove everything but the best 2 snakes
	while(pop.length >= 5){
		pop.pop()
		snakes.pop()
	}
	
	//randomly mutate some of the snakes
	for(let i = 0; i < (pop.length); i++){
		if(Math.floor(Math.random() * 1000) % 5 == 0){
			mutate(pop[i])
		}

		console.log("test" + pop[i].numHidden)
	}

	for(let i = 0; i < snakes.length; i++){
		snakes[i].dead = false
		snakes[i].fitness = 0
		snakes[i].restart()
		snakes[i].inputDirection = {x:0 , y:-1}
	}

	for(let k = 0; k < pop.length; k++){
		let male = Math.floor(Math.random() * (pop.length-1))
		let female = Math.floor(Math.random() * (pop.length-1))

		if(male != female){
			let dad = pop[male]
			let mom = pop[female]
			children = breed(mom, dad)	
		}
		else{
			continue
		}
		for(let j = 0; j < children.length; j++){
			newGen.push(children[j])
			snakes.push(new Snake("Snake"+snakes.length))
		}
	}
	
	let retVal = pop.concat(newGen)

	return{
		retVal,
		snakes
	}
}

