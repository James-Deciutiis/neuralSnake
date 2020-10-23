const brain = require('brain.js')

// provide optional config object (or undefined). Defaults shown.
const config = {
  binaryThresh: 0.5, // ¯\_(ツ)_/¯
  hiddenLayers: [16], // array of ints for the sizes of the hidden layers in the network
  activation: 'sigmoid' // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh']
};

// create a simple feed forward neural network with backpropagation
const net = new brain.NeuralNetwork(config);

net.train([
	{
	//snake looks north
		input: {'north': 1},
    		output: {'north' : 5,
			'east' : -1,
			'west' : -1,
			'south': -1
		}
	},
	{
		input: {'north': 0},
		output: {
			'east' : 1,
			'west' : 1,
			'north': -4,
			'south': -4
		}
	},
	{
		input: {'north': 0},
		output: {
			'east' : 1,
			'west' : 1,
			'north': -4,
			'south': -4
		}
	},
	//snake looks east
	{
		input: {'east': 1},
    		output: {'north' : -1,
			'east' : 5,
			'west' : -1,
			'south': -1
		}
	},
	{
		input: {'east': 0},
		output: {
			'east' : -4,
			'west' : -4,
			'north': 1,
			'south': 1
		}
	},
	{
		input: {'east': 0},
		output: {
			'east' : -4,
			'west' : -4,
			'north': 1,
			'south': 1
		}
	},
	//snake looks south
	{
		input: {'south': 1},
    		output: {'north' : -1,
			'east' : -1,
			'west' : -1,
			'south': 5
		}
	},
	{
		input: {'south': 0},
		output: {
			'east' : 1,
			'west' : 1,
			'north': -4,
			'south': -4
		}
	},
	{
		input: {'south': 0},
		output: {
			'east' : 1,
			'west' : 1,
			'north': -4,
			'south': -4
		}
	},
	//snake looks west
	{
		input: {'west': 1},
    		output: {'north' : -1,
			'east' : -1,
			'west' : 5,
			'south': -1
		}
	},
	{
		input: {'west': 0},
		output: {
			'east' : -4,
			'west' : -4,
			'north': 1,
			'south': 1
		}
	},
	{
		input: {'west': 0},
		output: {
			'east' : -4,
			'west' : -4,
			'north': 1,
			'south': 1
		}
	},
	//snake looks north-east
	{
		input: {'north-east': 1},
    		output: {
			'north': 5,
			'east' : 5,
			'south': -1,
			'west' : -1
		}
	},
	{
		input: {'north-east': 0},
		output: {
			'east' : -4,
			'west' : 1,
			'north': -4,
			'south': 1
		}
	},
	{
		input: {'north-east': 0},
		output: {
			'east' : -4,
			'west' : 1,
			'north': -4,
			'south': 1
		}
	},
	//snake looks north-west
	{
		input: {'north-west': 1},
    		output: {
			'north': 5,
			'east' : -1,
			'south': -1,
			'west' : 5
		}
	},
	{
		input: {'north-west': 0},
		output: {
			'east' : 1,
			'west' : -4,
			'north': -4,
			'south': 1
		}
	},
	{
		input: {'north-west': 0},
		output: {
			'east' : 1,
			'west' : -4,
			'north': -4,
			'south': 1
		}
	},
	//snake looks south-east
	{
		input: {'south-east': 1},
    		output: {
			'north': -1,
			'east' : 5,
			'south': 5,
			'west' : -1
		}
	},
	{
		input: {'south-east': 0},
		output: {
			'east' : -4,
			'west' : 1,
			'north': 1,
			'south': -4
		}
	},
	{
		input: {'south-east': 0},
		output: {
			'east' : -4,
			'west' : 1,
			'north': 1,
			'south': -4
		}
	},
	//snake looks south-west
	{
		input: {'south-west': 1},
    		output: {
			'north': -1,
			'east' : -1,
			'south': 5,
			'west' : 5
		}
	},
	{
		input: {'south-west': 0},
		output: {
			'east' : 1,
			'west' : -4,
			'north': 1,
			'south': -4
		}
	},
	{
		input: {'south-west': 0},
		output: {
			'east' : 1,
			'west' : -4,
			'north': 1,
			'south': -4
		}
	},
], {
	iterations: 50000,
	errorThresh: .001
});

let output = net.run({'north': 1}, {'south': 0}, {'west': 0 }, {'east': 0}, {'south-west': 0}, {'south-east': 0}, {'north-east': 0}, {'north-west': 0}); // [4.987]
let largestResult = 0.0
let result = ''
for(let move in output){
	if(output[move] > largestResult){
		largestResult = output[move]
		result = move
	}
}

console.log(output)
console.log(result)

