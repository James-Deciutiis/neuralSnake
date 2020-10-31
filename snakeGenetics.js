function createPopulation(size){
	let pop = []
	for(let i = 0; i < pop; i++){
		let nn = new neuralNetwork(6, Math.random(), 4)   
		pop[i] = nn
	}
	
	return pop
}

function breed(mother, father){
	let children = []
	for(int i = 0; i < 2; i++){
		let child = new neuralNetwork(6, (mother.getHidden/father.getHidden)/2, 4)	
		children.push(child)
	}
	
	return children
}

function mutate(network){
	network.setHidden((getHidden+Math.random()/2))
}

function evolve(pop){
	pop.sort(function(a.errorScore, b.errorScore){return a.errorScore - b.errorScore})
	
	for(int j = 0; j < (pop.length)/2; j++){
		pop.pop()
	}

	
	if(Math.random() % 4 == 0){
		mutate(generation[i])
	}
}

