var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var game, snake, food, ai;

Movement = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  CONTINUE: -1
}

Array.prototype.compare = function(obj, fn) {
  var i = this.length;
  while (i--) {
    if (fn(this[i], obj))
      return true;
  }
  return false
}

Array.prototype.print = function(fn) {
  var i = this.length;
  while (i--) {
    fn(i,this[i]);
  }
}

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
        return true;
    }
  }
  return false;
}

Array.prototype.map = function(fn){
  var map = [];
  for(var i = 0; i < this.length; i++)
  {
    map[i] = fn(this[i]);
  }
  return map;
}

game = {

  score: 0,
  fps: 8,
  over: false,
  message: null,
  board: null,
  startTime: null,
  timer: null,
  paused: false,
  time: 20,
  pauseTime: null,

  start: function() {
    game.over = false;
    game.message = null;
    game.pauseTimer = null;
    game.paused = false;
    game.time = 20;
    game.score = 0;
    game.fps = 8;
    game.board = [];
    game.startTime = Date.now();
    snake.init();
    food.set();
    game.timer = setInterval(function() {
      var sec = Math.round(((Date.now() - game.startTime) / 1000) % 60);
      var min = Math.round(((Date.now() - game.startTime) / 60000) % 60);
      game.drawTime(min , sec);
    }, 1000);
    ai.init();
  },

  stop: function() {
    game.over = true;
    game.message = "GAME OVER - PRESS SPACEBAR";
    clearInterval(game.timer);
    clearInterval(game.pauseTimer);
  },

  drawBox: function(x, y, size, color, fill) {
    context.beginPath();
    context.moveTo(x - (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y - (size / 2));
    context.lineTo(x + (size / 2), y + (size / 2));
    context.lineTo(x - (size / 2), y + (size / 2));
    context.closePath();
    if (fill) {
      context.fillStyle = color;
      context.fill();
    }
    else {
      context.strokeStyle = color;
      context.stroke();
    }
  },

  drawScore: function() {
    var element = document.getElementById("score");
    element.style.textAlign = 'center';
    element.style.display = 'block';
    element.style.fontSize = 'x-large';
    element.style.fontWeight = "bold";
    element.innerHTML = "Score : " + game.score;
  },

  getSearch: function() {
    var isBFS   = document.getElementById('BFS').checked,
        isDFS   = document.getElementById('DFS').checked,
        isAStar = document.getElementById('AStar').checked;

    if (isBFS) return "BFS";
    if (isDFS) return "DFS";
    if (isAStar) return "A*";
  },

  drawTime: function(min, sec) {
      var element = document.getElementById("time");
      element.style.textAlign = 'center';
      element.style.display = 'block';
      element.style.fontSize = 'x-large';
      element.style.fontWeight = "bold";
      if( min < 10 )
        min = '0' + min;
      if(sec < 10)
        sec = '0' + sec;
      element.innerHTML = "Time : " + min + ":" + sec;
  },

  drawMessage: function() {
    context.fillStyle = '#00F';
    context.strokeStyle = '#FFF';
    context.font = (canvas.height / 20) + 'px Impact';
    context.textAlign = 'center';
    context.fillText(game.message, canvas.width / 2, canvas.height / 2);
    context.strokeText(game.message, canvas.width / 2, canvas.height / 2);
  },

  drawGrid: function() {
    game.board = [];
    var row = col = 0;
    for(var i = snake.size/2; i < canvas.width; i += snake.size){
      game.board.push([]);
      for(var j = snake.size/2; j < canvas.height; j += snake.size){
        game.drawBox(i,j,snake.size, '#070821', false);
        if(food.x === i && food.y === j){
          game.board[row].push({x: i, y: j, type: 1});
        }
        else if (snake.sections.contains(i + "," + j)){
          game.board[row].push({x: i, y: j, type: 2});
        }
        else{
          game.board[row].push({x: i, y: j, type: 0});
        }
        col++;
      }
      row++;
    }
  },

  printGrid: function() {
    //console.log(game.board);
    //console.log(food.getPosition());
    //console.log(snake.getPosition());
  },

  resetCanvas: function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

};

snake = {

  size: canvas.width / 20,
  x: null,
  y: null,
  color: '#09c72b',
  direction: 'left',
  sections: [],

  init: function() {
    snake.sections = [];
    snake.direction = 'left';
    snake.x = canvas.width / 2 + snake.size / 2;
    snake.y = canvas.height / 2 + snake.size / 2;
    for (var i = snake.x + (5 * snake.size); i >= snake.x; i -= snake.size) {
      snake.sections.push(i + ',' + snake.y);
    }
  },

  move: function() {
    switch (snake.direction) {
      case 'up':
        snake.y -= snake.size;
        break;
      case 'down':
        snake.y += snake.size;
        break;
      case 'left':
        snake.x -= snake.size;
        break;
      case 'right':
        snake.x += snake.size;
        break;
    }
    snake.checkCollision();
    snake.checkGrowth();
    snake.sections.push(snake.x + ',' + snake.y);
  },

  draw: function() {
    for (var i = 0; i < snake.sections.length; i++) {
      snake.drawSection(snake.sections[i].split(','));
    }
  },

  drawSection: function(section) {
    game.drawBox(parseInt(section[0]), parseInt(section[1]), snake.size, snake.color, true);
  },

  checkCollision: function() {
    if (snake.isCollision(snake.x, snake.y) === true) {
      game.stop();
    }
  },

  isCollision: function(x, y) {
    if (x < snake.size / 2 ||
        x > canvas.width ||
        y < snake.size / 2 ||
        y > canvas.height ||
        snake.sections.indexOf(x + ',' + y) >= 0)
      return true;
  },

  getPosition: function() {
    var boardValues = [];
    for(var i = 0; i < this.sections.length - 1; i++)
    {
      var pos = this.sections[i].split(',');
      boardValues.push(Math.ceil(parseInt(pos[0])/snake.size) +
        " " + Math.ceil(parseInt(pos[1])/snake.size));
    }
    return boardValues;
  },

  checkGrowth: function() {
    if (snake.x == food.x && snake.y == food.y) {
      game.score++;
      if (game.score % 5 == 0 && game.fps < 60) {
        game.fps++;
      }
      food.set();
    } else {
      snake.sections.shift();
    }
  }

};

food = {

  size: null,
  x: null,
  y: null,
  color: '#00d5ff',

  set: function() {
    food.size = snake.size;
    food.x = (Math.ceil(Math.random() * 5) * snake.size * 4) - snake.size / 2;
    food.y = (Math.ceil(Math.random() * 5) * snake.size * 3) - snake.size / 2;
  },

  draw: function() {
    game.drawBox(food.x, food.y, food.size, food.color, true);
    game.printGrid();
  },

  getPosition: function() {
    return [Math.ceil(food.x/snake.size),
            Math.ceil(food.y/snake.size)];
  }

};

ai = {
  moveQueue: [],
  optionalMoves: [],
  locationOfFood: [],
  currentDirection: 0,
  inSearch: false,

  init: function(){
    this.inSearch = false;
    this.moveQueue = [];
    this.locationOfFood = [0,0];
    this.currentDirection = 0;
    this.optionalMoves = [];
  },

  addMove: function(move){
    this.moveQueue.push(move);
  },

  DFS: function() {

    var open = [],
        closed = [];

    open.push({pos: Math.ceil(snake.x/snake.size) + "," +
      Math.ceil(snake.y/snake.size),
      body: snake.getPosition(),
      parent: null,
      move: snake.direction});
    this.inSearch = true;

    var foodPosition = food.getPosition();
    var foodPos = foodPosition[0] + "," + foodPosition[1];

    while (open.length !== 0)
    {
      var current = open.pop();

      if (current.pos === foodPos)
      {
        console.log('success'); //success
        //build reverse tree
        this.addMove(current.move);
        var curParent = current.parent;
        while (curParent)
        {
          this.addMove(curParent.move);
          curParent = curParent.parent;
        }
        return true;
      }
      else
      {
        closed.push(current);
        this.getOptionalMoves(current);
        var nxtMoves = this.computeNextMoveCoordinates(current);

        var comparePosition = function(a, b) {
          if( a.pos === undefined || b.pos === undefined )
            return false;
          else
            return a.pos === b.pos;
        }

        for(var i = 0; i < nxtMoves.length; i++)
        {
          if( !open.compare(nxtMoves[i], comparePosition) &&
              !closed.compare(nxtMoves[i], comparePosition) )
            open.push(nxtMoves[i]);
        }
      }
    }
    console.log('failure');
    return false;
  },

  BFS: function() {

    var open = [],
        closed = [];

    open.push({pos: Math.ceil(snake.x/snake.size) + "," +
      Math.ceil(snake.y/snake.size),
      body: snake.getPosition(),
      parent: null,
      move: snake.direction});
    this.inSearch = true;

    var foodPosition = food.getPosition();
    var foodPos = foodPosition[0] + "," + foodPosition[1];

    while (open.length !== 0)
    {
      var current = open.shift();

      console.log("food : " + foodPos);

      if (current.pos === foodPos)
      {
        console.log('success'); //success
        //build reverse tree
        this.addMove(current.move);
        var curParent = current.parent;
        while (curParent)
        {
          this.addMove(curParent.move);
          curParent = curParent.parent;
        }
        console.log("exe");
        return true;
      }
      else
      {
        closed.push(current);
        this.getOptionalMoves(current);
        var nxtMoves = this.computeNextMoveCoordinates(current);

        var comparePosition = function(a, b) {
          if( a.pos === undefined || b.pos === undefined )
            return false;
          else
            return a.pos === b.pos;
        }

        for(var i = 0; i < nxtMoves.length; i++)
        {
          if( !open.compare(nxtMoves[i], comparePosition) &&
              !closed.compare(nxtMoves[i], comparePosition) )
            open.push(nxtMoves[i]);
        }
      }
    }
    console.log('failure');
    return false;
  },

  getOptionalMoves: function(parent){
    //console.log("get moves " + parent.pos);
    var positions = parent.body;
    var par = parent.pos.split(",");
    var x = parseInt(par[0]);//Math.ceil(snake.x/snake.size);//par[0];
    var y = parseInt(par[1]);//Math.ceil(snake.y/snake.size);//par[1];

    //console.log("Our position is : x:" + x + ", y:" + y);

    var left  = (x - 1) + " " + y;
    var right = (x + 1) + " " + y;
    var up    = x + " " + (y - 1);
    var down  = x + " " + (y + 1);

    var leftWall  = (x - 1) < 0;
    var rightWall = (x + 1) > 20;
    var upWall    = (y - 1) < 0;
    var downWall  = (y + 1) > 20;

    this.optionalMoves = [];
    switch (parent.move){
      case "up":
        //check left and right
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.LEFT);
        if( !positions.contains(right) && !rightWall )
          this.optionalMoves.push(Movement.RIGHT);
        if( !positions.contains(up) && !upWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "down":
        //check left and right
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.LEFT);
        if( !positions.contains(right) && !rightWall )
          this.optionalMoves.push(Movement.RIGHT);
        if( !positions.contains(down) && !downWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "left":
        //check up and down
        if( !positions.contains(up) && !upWall )
          this.optionalMoves.push(Movement.UP);
        if( !positions.contains(down) && !downWall )
          this.optionalMoves.push(Movement.DOWN);
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "right":
        //check up and down
        if( !positions.contains(up) && !upWall )
          this.optionalMoves.push(Movement.UP);
        if( !positions.contains(down) && !downWall )
          this.optionalMoves.push(Movement.DOWN);
        if( !positions.contains(right) && !rightWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;
    }
  },

  computeNextMoveCoordinates: function(parent){
    //console.log(parent.pos + " compute ");
    var par = parent.pos.split(",");
    var x = parseInt(par[0]);
    var y = parseInt(par[1]);

    var left   = (x - 1) + "," + y;
    var leftFn = function(element) {
      var splitElement = element.split(" ");
      return (parseInt(splitElement[0]) - 1) + " " + parseInt(splitElement[1]);
    };
    var right   = (x + 1) + "," + y;
    var rightFn = function(element) {
      var splitElement = element.split(" ");
      return (parseInt(splitElement[0]) + 1) + " " + parseInt(splitElement[1]);
    };
    var up    = x + "," + (y - 1);
    var upFn  = function(element) {
      var splitElement = element.split(" ");
      return parseInt(splitElement[0]) + " " + (parseInt(splitElement[1]) - 1);
    };
    var down   = x + "," + (y + 1);
    var downFn = function(element) {
      var splitElement = element.split(" ");
      return parseInt(splitElement[0]) + " " + (parseInt(splitElement[1]) + 1);
    };

    var moves = [];

    //console.log("up : " + up + " down : " + down + " left : " + left + " right : " + right);
    //console.log("Optional Moves : " + this.optionalMoves);
    //console.log(parent.move);

    for(var i = 0; i < this.optionalMoves.length; i++)
    {
      switch (this.optionalMoves[i])
      {
        case Movement.UP:
          // up
          parent.body.push(up.replace(/,/g, " "));
          moves.push({pos: up,
            body: parent.body,
            parent: parent,
            move: "up"});
          break;
        case Movement.DOWN:
          // down
          parent.body.push(down.replace(/,/g, " "));
          moves.push({pos: down,
            body: parent.body,
            parent: parent,
            move: "down"});
          break;
        case Movement.LEFT:
          //left
          parent.body.push(left.replace(/,/g, " "));
          moves.push({pos: left,
            body: parent.body,
            parent: parent,
            move: "left"});
          break;
        case Movement.RIGHT:
          //right
          parent.body.push(right.replace(/,/g, " "));
          moves.push({pos: right,
            body: parent.body,
            parent: parent,
            move: "right"});
          break;
        default:
          switch (parent.move)
          {
            case "up":
              parent.body.push(up.replace(/,/g, " "));
              moves.push({pos: up,
                body: parent.body,
                parent: parent,
                move: "up"});
              break;
            case "down":
              parent.body.push(down.replace(/,/g, " "));
              moves.push({pos: down,
                body: parent.body,
                parent: parent,
                move: "down"});
              break;
            case "left":
              parent.body.push(left.replace(/,/g, " "));
              moves.push({pos: left,
                body: parent.body,
                parent: parent,
                move: "left"});
              break;
            case "right":
              parent.body.push(right.replace(/,/g, " "));
              moves.push({pos: right,
                body: parent.body,
                parent: parent,
                move: "right"});
              break;
          }
          break;
      }
      parent.body.shift();
    }
    return moves;
  },

  computeRandomNextMove: function(){
    //this.getOptionalMoves({pos: Math.ceil(snake.x/snake.size) + "," + Math.ceil(snake.y/snake.size)});
    var num = Math.ceil(( Math.random() * this.optionalMoves.length ));

    switch (this.optionalMoves[num - 1]) {
      case Movement.UP:
        return "up";
        break;

      case Movement.DOWN:
        return "down";
        break;

      case Movement.LEFT:
        return "left";
        break;

      case Movement.RIGHT:
        return "right";
        break;

      default:
        return snake.direction;
        break;
    }
  },

  setFoodLocation: function(x, y){
    this.locationOfFood[0] = x;
    this.locationOfFood[1] = y;
  },

  doMove: function(snake){
    console.log(this.moveQueue.length);
    if (this.moveQueue.length !== 0)
    {
      snake.direction = this.moveQueue.pop();
      console.log(snake.direction);
    }
    else
      this.inSearch = false;
  }
};

var inverseDirection = {
  'up': 'down',
  'left': 'right',
  'right': 'left',
  'down': 'up'
};

var keys = {
  up: [38, 75, 87],
  down: [40, 74, 83],
  left: [37, 65, 72],
  right: [39, 68, 76],
  start_game: [13, 32]
};

function getKey(value){
  for (var key in keys){
    if (keys[key] instanceof Array && keys[key].indexOf(value) >= 0){
      return key;
    }
  }
  return null;
}

function togglePause() {
  if (!game.paused){
    clearInterval(game.pauseTimer);
    game.paused = true;
  } else {
    game.pauseTimer = setTimeout(function() {
      requestAnimationFrame(loop);
    }, 1000/game.fps);
    game.paused = false;
  }
}

addEventListener("keydown", function (e) {
  var lastKey = getKey(e.keyCode);
  if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0
      && lastKey != inverseDirection[snake.direction]) {
    snake.direction = lastKey;
  } else if (['start_game'].indexOf(lastKey) >= 0 && game.over) {
    game.start();
  } else if (['start_game'].indexOf(lastKey) >= 0 && !game.over) {
    togglePause();
  }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame;

function loop() {
  if (game.over == false) {
    game.resetCanvas();
    game.drawScore();
    game.drawGrid();
    if( !ai.inSearch )
    {
      switch(game.getSearch())
      {
        case 'BFS':
          ai.BFS();
          break;

        case 'DFS':
          ai.DFS();
          break;

        case 'A*':
          break;
      }
    }
    ai.doMove(snake);
    snake.move();
    food.draw();
    snake.draw();
  }
  else
    game.drawMessage();
  game.pauseTimer = setTimeout(function() {
    requestAnimationFrame(loop);
  }, 1000/game.fps);
}
