var canvas = document.getElementById("the-game");
var context = canvas.getContext("2d");
var GRID_SIZE = 20;

snake = {
  size: canvas.width / GRID_SIZE,
  x: null,
  y: null,
  color: '#09c72b',
  direction: 'left',
  sections: [],

  init: function() {
    snake.sections = [];
    snake.direction = 'left';
    snake.x = canvas.width / 2 + snake.size;
    snake.y = canvas.height / 2 + snake.size;
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
    game.drawBox(parseInt(section[0]),
                 parseInt(section[1]),
                 snake.size,
                 snake.color,
                 true);
  },

  checkCollision: function() {
    if (snake.isCollision(snake.x, snake.y))
      game.stop();
  },

  isCollision: function(x, y) {
    if (x < game.board[0][0].x ||
        x > game.board[18][0].x ||
        y < game.board[0][0].y ||
        y > game.board[0][18].y ||
        snake.sections.indexOf(x + ',' + y) >= 0)
      return true;
  },

  getPosition: function() {
    var boardValues = [];
    for(var i = 0; i < this.sections.length; i++)
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
