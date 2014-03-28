//Define My and Comp objects, game data
var My = {
	matrix: [],				//Game matrix, keeps information about ships and their bounds(invisible)
	area: null,					//Game area (visible part)
	currentShipSize: 0,			//Detected ship's size
	detectedShipPartsNum: 0,	//Num of detected ship's parts
	startX: 10,					//Initial coordinates
	startY: 10,
	endY: -1,					//Eventual coordinates
	endX: -1,
	points: 0					//Total number of detected decks
};
var Comp = {
	matrix: [],
	area: null, 
	AI: null,
	currentShipSize: 0,
	detectedShipPartsNum: 0,
	startX: 10,
	startY: 10,
	endY: -1,
	endX: -1,
	points: 0
};
var turn = 1;	//1 - my turn, 0 - computer's turn
var scoreData, informationData;	//scoreData displays your score, informationData displays all necessary information

window.onload = function (){
	//Define both areaes, create their cells and
	My.area = document.getElementById('area1');
	Comp.area = document.getElementById('area2');
	informationData = document.getElementById('left');
	init(My);	//Define game matrixes and create area cells
	init(Comp);

	Comp.AI = new AITools(Comp.matrix);	//Create Computer AI Tools (AITools.js)

	var shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];	//List of ship sizes
	var isVertical;	//Decides if ship will be isVerticalical or not

	for (i=0;i<10;i++){		//Placing computer's ships
		Comp.AI.rebuildPositions(shipSizes[i]);
		isVertical = Math.floor(Math.random()*2);	//1 - isVertical, 0 - horizontal
		var position = Comp.AI.getXY(isVertical);	//Get random position from list of possible positions
		var x = position.x;	//Fixing this position's coordinates
		var y = position.y;
		if (isVertical){
			for (j=0;j<shipSizes[i];j++){
				Comp.matrix[y+j][x] = shipSizes[i];		//Mark choosed cell in comupter's matrix as i-decked ship
			}
			setShipBounds(y, x, shipSizes[i], 1, Comp.matrix);	//Setting ship bounds
		} else {
			for (j=0;j<shipSizes[i];j++){
				Comp.matrix[y][x+j] = shipSizes[i];
			}
			setShipBounds(y, x, 1, shipSizes[i], Comp.matrix);
		}
	}
	//Placing my ships
	i = 0;	//Index of current ship size
	j = 0;	//Number of setted decks
	var availablePositions = [];	//list of current available positions (if num of decks more than one)

	My.area.addEventListener('click', placeMyShips);	//Add 'click' event listener to set my ships
	refreshData('Place '+shipSizes[i]+' decked ship');

	function placeMyShips(e) {
		var that = e.target;	//The object we clicked
		if (that.className=='horizontal' && ((My.area.className=='unready' && that.id=='free') || (My.area.className=='placing' && that.id=='available'))){	//If we clicked free or available cell
			var x = getIndexOf(that);	//Fixing index of clicked cell
			var y = getIndexOf(that.parentNode);	//Fixing index of clicked cell parent (isVertical DOM element)
			that.id = 'ship';	//Mark cell as ship
			My.matrix[y][x] = shipSizes[i];	//Mark appropritae cell in my matrix as ship
			//Solving initial and eventual coordinates of ship
			if (x<My.startX){
				My.startX = x;
			}
			if (y<My.startY){
				My.startY = y;
			}
			if (x>My.endX){
				My.endX = x;
			}
			if (y>My.endY){
				My.endY = y;
			}
			//Reset list of available positions
			for (var k=0, len=availablePositions.length;k<len;k++){
				if (availablePositions[k].id!='ship'){
					availablePositions[k].id = 'free';
				}
			}
			availablePositions = [];
			if (++j==shipSizes[i]){	//If we placed all decks we had to
				isVertical = (My.startY-My.endY);	//Solving if ship isVertical or not
				if (isVertical){
					setShipBounds(My.startY, My.startX, shipSizes[i], 1, My.matrix, My.area);
				} else {
					setShipBounds(My.startY, My.startX, 1, shipSizes[i], My.matrix, My.area);
				}
				My.startX = (My.startY = 10);
				My.endX = (My.endY = -1);
				if (i<9){	//If we didn't placed yet all ships
					My.area.className = 'unready';
					i++;
					j = 0;
					refreshData('Place '+shipSizes[i]+' decked ship');
				} else {
					My.area.removeEventListener('click', placeMyShips);
					startGame();
				}
			} else {	//Making some cells available to choose
				isVertical = (My.startY-My.endY);
				if (isVertical || j==1){
					if(My.startY>0){
						setCellAvailable(My.area.children[My.startY-1].children[x], availablePositions);
					}
					if (My.endY<9){
						setCellAvailable(My.area.children[My.endY+1].children[x], availablePositions);
					}
				}
				if (!isVertical || j==1){
					if (My.startX>0){
						setCellAvailable(My.area.children[y].children[My.startX-1], availablePositions);
					}
					if (My.endX<9){
						setCellAvailable(My.area.children[y].children[My.endX+1], availablePositions);
					}
				}
				My.area.className = 'placing';	//Making other cells unavailable to click, changing my area's class name
			}
		}
	}

}

//Cells processing

function init(obj){		//Init game matrix and area
	for (var i=0;i<10;i++) {
		obj.matrix.push([]);		//Defining game matrix
		createCell('isVertical', obj.area);	//Creating isVertical element
		for (var j=0;j<10;j++) {
			obj.matrix[i].push(0);		//Filling game matrixes with 0
			createCell('horizontal', obj.area.lastChild);	//Creating horizontal element
		}
	}
}

function createCell(cellClass, parent){	//Creates DOM elements in player's area
	var cell = document.createElement('div');
	cell.className = cellClass;
	if (cellClass=='horizontal'){
		cell.id = 'free';
	}
	parent.appendChild(cell);
}

function setShipBounds(y, x, height, width, matrix, area, removeComputerAIPosition){	//Sets ship bounds
	//Corners
	if (y>0&&x>0){
		setBound(y-1, x-1, matrix, area, removeComputerAIPosition);
	}
	if (y>0&&x+width<10){
		setBound(y-1, x+width, matrix, area, removeComputerAIPosition);
	}
	if (y+height<10&&x>0){
		setBound(y+height, x-1, matrix, area, removeComputerAIPosition);
	}
	if (y+height<10&&x+width<10){
		setBound(y+height, x+width, matrix, area, removeComputerAIPosition);
	}

	//isVerticalical
	if (x>0){
		for (var i=y;i<y+height;i++){
			setBound(i, x-1, matrix, area, removeComputerAIPosition);
		}
	}
	if (x+width<10){
		for (i=y;i<y+height;i++){
			setBound(i, x+width, matrix, area, removeComputerAIPosition);
		}
	}

	//Horizontal
	if (y>0){
		for (i=x;i<x+width;i++){
			setBound(y-1, i, matrix, area, removeComputerAIPosition);
		}
	}
	if (y+height<10){
		for (i=x;i<x+width;i++){
			setBound(y+height, i, matrix, area, removeComputerAIPosition);
		}
	}
}

function setBound(y, x, matrix, area, removeComputerAIPosition){	//Makes cell bound and removes computer's positions(only if game started)
	if (matrix && matrix[y][x]==0){
		matrix[y][x] = -1;
	}
	if (area && area.children[y].children[x].id=='free'){
		area.children[y].children[x].id = 'bound';
	}
	if (removeComputerAIPosition){
		Comp.AI.removePosition(y, x);
	}
}

function getIndexOf(element){	//Gets index of element
	var parent = element.parentNode;
	var index = 0;
	while (parent.children[index]!=element){
		index++;
	}
	return index;
}

function setCellAvailable(cell, availablePositions){	//Sets cell available to click, when other cells are unavailable
	if (cell.id!='ship'&&cell.id!='bound'){
		availablePositions.push(cell);
		cell.id = 'available';
	}
}

//Attacks processing

function myTurn(e){		//Processes my turn
	if (turn && e.target.className=='horizontal' && e.target.id=='free'){
		attack(e.target, My, Comp);	//Attacks choosed cell
	}
}

function compTurn (){	//Processes computer turn
	var position = Comp.AI.getPosition();	//Gets random available position
	attack(My.area.children[position.y].children[position.x], Comp, My);
}

function attack(cell, player, enemy){
	var x = getIndexOf(cell);	//Fixing cell's index
	var y = getIndexOf(cell.parentNode);	//Fixing cell's parent index
	if (enemy.matrix[y][x]>0){	//If cell is a ship
		cell.id = 'damaged';	//Mark cell as damaged ship
		player.points++;		//Increase player's points
		player.detectedShipPartsNum++;	//Increase number of detected ship parts
		if (!player.currentShipSize){	//Fixing detected ship size
			player.currentShipSize = enemy.matrix[y][x];
		}
		if (x<player.startX){	//Fixing initital coordinates of this ship
			player.startX = x;
		}
		if (y<player.startY){
			player.startY = y;
		}
		if (x>player.endX){	//Fixing eventual coordinates of this ship
			player.endX = x;
		}
		if (y>player.endY){
			player.endY = y;
		}
		if (player.detectedShipPartsNum==player.currentShipSize){	//If whole ship was detected
			var isVertical = (player.startY-player.endY);
			if (isVertical){	//If this ship is isVertical, set bounds for this ship
				setShipBounds(player.startY, player.startX, player.currentShipSize, 1, undefined, enemy.area, (!turn)?true:false);
			} else {
				setShipBounds(player.startY, player.startX, 1, player.currentShipSize, undefined, enemy.area, (!turn)?true:false);
			}
			player.detectedShipPartsNum = 0;	//Reset detected ship data (detected parts num, size and initital coordinates)
			player.currentShipSize = 0;
			player.startX = (player.startY = 10);
			player.endX = (player.endY = -1);
			if (My.points==20){			//Stop game, if me or computer win
				stopGame(true);
				return;
			}
			if (Comp.points==20){
				stopGame(false);
				return;
			}
			if (!turn){		//If computer's turn, reset hot positions and make next turn
				Comp.AI.resetHotPositions();
				setTimeout(compTurn, 1000);
			} else {
				refreshData('You got his '+enemy.matrix[y][x]+'-decked!');
			}
		} else {
			if (turn){
				refreshData('Good job! Get him');
			}
		}
		if (!turn && player.currentShipSize>1){		//If computer's turn, set his hot positions
			Comp.AI.resetHotPositions();
			var isVertical = (player.startY-player.endY);
			if (isVertical || player.detectedShipPartsNum==1){
				if(player.startY>0){
					Comp.AI.setHotPosition(player.startY-1, x);
				}
				if (player.endY<9){
					Comp.AI.setHotPosition(player.endY+1, x);
				}
			}
			if (!isVertical || player.detectedShipPartsNum==1){
				if (player.startX>0){
					Comp.AI.setHotPosition(y, player.startX-1);
				}
				if (player.endX<9){
					Comp.AI.setHotPosition(y, player.endX+1);
				}
			}
			setTimeout(compTurn, 1000);
		}
	} else {		//If player did not detect a ship, change turn
		turn = !turn;		
		if (!turn){
			setTimeout(compTurn, 1000);
		} else {
			refreshData('Your turn');
		}
		cell.id = 'empty';	//Mark cell as empty
	}	
}

function refreshData(data){		//Displays necessary and scores
	informationData.innerHTML = data;
	if (scoreData){
		scoreData.innerHTML = My.points+' : '+Comp.points;
	}
}

function startGame(){			//Prepares all data for start game
	for (var i=0;i<10;i++) {
		for (var j=0;j<10;j++) {
			if (My.matrix[i][j]<=0){
				My.area.children[i].children[j].id = 'free';	//Hides all your bounds
			}
		}
	}
	My.area.className = 'ready';
	Comp.area.className = 'ready';
	Comp.AI.ready();	//Prepares comuter's AI to play
	Comp.area.addEventListener('click', myTurn);
	scoreData = document.getElementById('center');	//Defines scores DOM element
	refreshData('Your turn');
}

function stopGame(win){		//Stops game, when someone wins
	refreshData((win)?'Congratulations! You win':'Don\'t worry, try again');
	Comp.area.removeEventListener('click', myTurn);
}