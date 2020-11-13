export class Matrix{
	constructor(rows, cols, data = []){
		this._rows = rows
		this._cols = cols
		this._data = data

		//populate matrix
		if(data == null || data.length == 0){
			this._data = []
			for(let i = 0; i < this._rows; i++){
				this._data[i] = []
				for(let j = 0; j < this._cols; j++){
					this._data[i][j] = 0
				}
			}
		}
		else{
			//make sure matrix dimensions are proper
			if (data.length != rows || data[0].length != cols){
				throw new Error("Make sure matrix dimensions are correct")
			}
		}
	}
		
	//getters
	get rows(){
		return this._rows
	}

	get cols(){
		return this._cols
	}

	get data(){
		return this._data
	}

	static checkDimensions(matrix1, matrix2){
		if(matrix1.rows != matrix2.rows || matrix1.cols != matrix2.cols){
			throw new Error("Matrices are not of the same dimensions")
		}
	}
	
	static addMatrices(matrix1, matrix2){
		Matrix.checkDimensions(matrix1, matrix2)
		let retval = new Matrix(matrix1.rows, matrix1.cols)
		for(let i = 0; i < retval.rows; i++){
			for(let j = 0; j < retval.cols; j++){
				retval.data[i][j] = (matrix1.data[i][j] + matrix2.data[i][j])
			}
		}

		return retval
	}
	
	static subtractMatrices(matrix1, matrix2){
		Matrix.checkDimensions(matrix1, matrix2)
		let retval = new Matrix(matrix1.rows, matrix1.cols)
		for(let i = 0; i < retval.rows; i++){
			for(let j = 0; j < retval.cols; j++){
				retval.data[i][j] = (matrix1.data[i][j] - matrix2.data[i][j])
			}
		}

		return retval
	}
	
	static multiplyMatrices(matrix1, matrix2){
		Matrix.checkDimensions(matrix1, matrix2)
		let retval = new Matrix(matrix1.rows, matrix1.cols)
		for(let i = 0; i < retval.rows; i++){
			for(let j = 0; j < retval.cols; j++){
				retval.data[i][j] = (matrix1.data[i][j] * matrix2.data[i][j])
			}
		}

		return retval
	}

	static dotProduct(matrix1, matrix2){
		if (matrix1.cols != matrix2.rows){
			throw new Error("Cant do dot product, invalid dimensions")
		}
		let retval = new Matrix(matrix1.rows, matrix2.cols)
		for(let i = 0; i < retval.rows; i++){
			for(let j = 0; j < retval.cols; j++){
				let sum = 0
				for(let k = 0; k < matrix1.cols; k++){
					sum += (matrix1.data[i][k] * matrix2.data[k][j])
				}
				retval.data[i][j] = sum
			}
		}
		
		return retval
	}

	static convertFromArray(array){
		return new Matrix(1, array.length, [array])
	}
	
	static map(matrix, mFunction){
		let retval = new Matrix(matrix.rows, matrix.cols)
		for (let i = 0; i < matrix.rows; i++){
			for (let j = 0; j < matrix.cols; j++){
				retval.data[i][j] = mFunction(matrix.data[i][j])
			}
		}

		return retval
	}

	static transpose(matrix){
		let retval = new Matrix(matrix.cols, matrix.rows)
		for(let i = 0; i < matrix.rows; i++){
			for(let j = 0; j < matrix.cols; j++){
				retval.data[j][i] = matrix.data[i][j]
			}
		}
		
		return retval
	}

	setRandomWeights(){
		for(let i = 0; i < this.rows; i++){
			for(let j = 0; j < this.cols; j++){
				this.data[i][j] = Math.random() * 2 - 1;
			}
		}
	}
	
	getRandomWeights(){
		let retVal = new Matrix(this.rows, this.cols)
		retVal.setRandomWeights()

		return retVal
	}	

}
	
