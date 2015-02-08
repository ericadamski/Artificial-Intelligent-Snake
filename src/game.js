var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var game, food;

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
  while (i--) fn(i,this[i]);
}

Array.prototype.contains = function(obj) {
  return this.indexOf(obj) >= 0;
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

  start: function() {
    game.over = false;
    game.message = null;
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
    for(var i = snake.size; i < canvas.width; i += snake.size){
      game.board.push([]);
      for(var j = snake.size; j < canvas.height; j += snake.size){
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

food = {

  size: null,
  x: null,
  y: null,
  color: '#00d5ff',

  set: function() {
    food.size = snake.size;
    food.x = (Math.ceil(Math.random() * 5) * snake.size * 4) - snake.size;
    food.y = (Math.ceil(Math.random() * 5) * snake.size * 3) - snake.size;
  },

  draw: function() {
    game.drawBox(food.x, food.y, food.size, food.color, true);
    //game.printGrid();
  },

  getPosition: function() {
    return [Math.ceil(food.x/snake.size), Math.ceil(food.y/snake.size)];
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

addEventListener("keydown", function (e) {
  var lastKey = getKey(e.keyCode);
  if (['up', 'down', 'left', 'right'].indexOf(lastKey) >= 0
      && lastKey != inverseDirection[snake.direction]) {
    snake.direction = lastKey;
  } else if (['start_game'].indexOf(lastKey) >= 0 && game.over) {
    game.start();
  }
}, false);

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.mozRequestAnimationFrame;

function loop()
{
  if (game.over == false)
  {
    //console.log(Math.ceil(snake.x/snake.size) + " " + Math.ceil(snake.y/snake.size));
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
    else
    {
      ai.doMove(snake);
      snake.move();
      console.log("SNAKE : " + snake.getPosition());
    }
    food.draw();
    snake.draw();
  }
  else
    game.drawMessage();

  setTimeout(function() {
    requestAnimationFrame(loop);
  }, 1000/game.fps);
}

requestAnimationFrame(loop);
