function AITools(matrix){
	this.positionsX, this.positionsY;	//All available vertical and horizontal positions while placing ships
	this.matrix = matrix;				//AI's game matrix
	this.shipSize;						//Current ship size
	this.positions;						//All available positions to attack
	this.hotPositions;					//Positions to attack right away, hot positions (if AI found part of your ship)

	this.ready = function(){
		this.positions = [];
		this.hotPositions = [];
		for (var i=0;i<10;i++){
			for (var j=0;j<10;j++){
				this.positions.push({y:i, x:j});
			}
		}
	}

	this.setHotPosition = function(y, x){
		for (var i=0, len=this.positions.length;i<len;i++){
			if (this.positions[i].y==y && this.positions[i].x==x){
				this.hotPositions.push({y:y, x:x});
				return;
			}
		}
	}

	this.resetHotPositions = function(){
		this.hotPositions = [];
	}

	this.getPosition = function(){
		var i, position;
		if (this.hotPositions.length>0){
			i = Math.floor(Math.random()*this.hotPositions.length);
			position = this.hotPositions[i];
			this.hotPositions.splice(i, 1);
			this.removePosition(position.y, position.x);
		} else {
			i = Math.floor(Math.random()*this.positions.length);
			position = this.positions[i];
			this.positions.splice(i, 1);
		}
		return position;
	}

	this.removePosition = function(y, x){
		for (var i=0;i<this.positions.length;i++){
			if (this.positions[i].y==y && this.positions[i].x==x){
				this.positions.splice(i, 1);
				return;
			}
		}
	}

	this.getXY = function(vertical){
		if (vertical){
			return this.positionsY[Math.floor(Math.random()*this.positionsY.length)]; 
		} else {
			return this.positionsX[Math.floor(Math.random()*this.positionsX.length)];
		}
	}

	this.rebuildPositions = function(shipSize){
		if (shipSize==this.shipSize){
			this.countPositions(this.positionsX, shipSize);
			this.countPositions(this.positionsY, shipSize);
		} else {
			this.shipSize = shipSize;
			var N = 11-shipSize;
			this.positionsX = [];
			this.positionsY = [];
			for (var i=0;i<N;i++){
				for (var j=0;j<N;j++){
					if (this.checkPositionX(i, j, shipSize)){
						this.positionsX.push({y:i, x:j});
					}
					if (this.checkPositionY(i, j, shipSize)){
						this.positionsY.push({y:i, x:j});
					}
				}
			}
		}
	}

	this.countPositions = function(positions, shipSize) {
		var type = (positions==this.positionsX)?'X':'Y';

		for (var i=positions.length-1;i>=0;i--){
			if (!this['checkPosition'+type](positions[i].y, positions[i].x, shipSize)){
				positions.splice(i, 1);
			}
		}
	}

	this.checkPositionX = function(y, x, shipSize){
		for (var i=0;i<shipSize;i++){	
			if (this.matrix[y][x+i]!=0){
				return false;
			}
		}
		return true;
	}

	this.checkPositionY = function(y, x, shipSize){
		for (var i=0;i<shipSize;i++){
			if (this.matrix[y+i][x]!=0){
				return false;
			}
		}
		return true;
	}
}