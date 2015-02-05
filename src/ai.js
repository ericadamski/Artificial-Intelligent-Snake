var canvas = document.getElementById("the-game");

ai = {
  moveQueue: [],
  optionalMoves: [],
  inSearch: false,

  init: function(){
    this.inSearch = false;
    this.moveQueue = [];
    this.optionalMoves = [];
  },

  addMove: function(move){
    this.moveQueue.unshift(move);
  },

  DFS: function() {

    var open = [],
        closed = [];

    open.push({pos: Math.ceil(snake.x/snake.size) + " " +
      Math.ceil(snake.y/snake.size),
      body: snake.getPosition(),
      parent: null,
      move: snake.direction});
    this.inSearch = true;

    var foodPosition = food.getPosition();
    var foodPos = foodPosition[0] + " " + foodPosition[1];

    while (open.length !== 0)
    {
      var current = open.shift();

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
            open.unshift(nxtMoves[i]);
        }
      }
    }
    console.log('failure');
    return false;
  },

  BFS: function() {

    var open = [],
        closed = [];

    open.push({pos: Math.ceil(snake.x/snake.size) + " " +
      Math.ceil(snake.y/snake.size),
      body: snake.getPosition(),
      parent: undefined,
      move: snake.direction});
    this.inSearch = true;

    while (open.length !== 0)
    {
      var current = open.shift();

      if (this.atFood(current))
      {
        console.log(current);
        console.log('success'); //success
        //build reverse tree
        this.addMove(current.move);
        if ( current.parent )
        {
          var curParent = current.parent;
          while (curParent)
          {
            this.addMove(curParent.move);
            curParent = curParent.parent;
          }

          console.log("Number of moves is " + this.moveQueue.length);
          console.log(this.moveQueue);
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

  getOptionalMoves: function(parent){
    var positions = parent.body;
    var par = parent.pos.split(" ");
    var x = parseInt(par[0]);
    var y = parseInt(par[1]);

    var left  = (x - 1) + " " + y;
    var right = (x + 1) + " " + y;
    var up    = x + " " + (y - 1);
    var down  = x + " " + (y + 1);

    console.log("Going: " + parent.move + " x : " + x + " y : " + y);
    console.log("Body : " + positions);
    console.log("Left: " + left + " Right: " + right + " up : " + up + " down: " + down);

    var leftWall  = (x - 1) < 1;
    var rightWall = (x + 1) > 20;
    var upWall    = (y - 1) < 1;
    var downWall  = (y + 1) > 20;

    this.optionalMoves = [];
    switch (parent.move){
      case "up":
        //check left and right and up
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.LEFT);
        if( !positions.contains(right) && !rightWall )
          this.optionalMoves.push(Movement.RIGHT);
        if( !positions.contains(up) && !upWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "down":
        //check left and right and down
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.LEFT);
        if( !positions.contains(right) && !rightWall )
          this.optionalMoves.push(Movement.RIGHT);
        if( !positions.contains(down) && !downWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "left":
        //check up and down and left
        if( !positions.contains(up) && !upWall )
          this.optionalMoves.push(Movement.UP);
        if( !positions.contains(down) && !downWall )
          this.optionalMoves.push(Movement.DOWN);
        if( !positions.contains(left) && !leftWall )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "right":
        //check up and down and right
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
    var par = parent.pos.split(" ");
    var x = parseInt(par[0]);
    var y = parseInt(par[1]);

    var newbody = parent.body.slice();

    var left   = (x - 1) + " " + y;
    var right  = (x + 1) + " " + y;
    var up     = x + " " + (y - 1);
    var down   = x + " " + (y + 1);

    var moves = [];

    for(var i = 0; i < this.optionalMoves.length; i++)
    {
      if (!this.atFood(parent)) newbody.shift();
      switch (this.optionalMoves[i])
      {
        case Movement.UP:
          // up
          newbody.push(up);
          moves.push({pos: up,
            body: newbody,
            parent: parent,
            move: "up"});
          break;
        case Movement.DOWN:
          // down
          newbody.push(down);
          moves.push({pos: down,
            body: newbody,
            parent: parent,
            move: "down"});
          break;
        case Movement.LEFT:
          //left
          newbody.push(left);
          moves.push({pos: left,
            body: newbody,
            parent: parent,
            move: "left"});
          break;
        case Movement.RIGHT:
          //right
          newbody.push(right);
          moves.push({pos: right,
            body: newbody,
            parent: parent,
            move: "right"});
          break;
        default:
          switch (parent.move)
          {
            case "up":
              newbody.push(up);
              moves.push({pos: up,
                body: newbody,
                parent: parent,
                move: "up"});
              break;
            case "down":
              newbody.push(down);
              moves.push({pos: down,
                body: newbody,
                parent: parent,
                move: "down"});
              break;
            case "left":
              newbody.push(left);
              moves.push({pos: left,
                body: newbody,
                parent: parent,
                move: "left"});
              break;
            case "right":
              newbody.push(right);
              moves.push({pos: right,
                body: newbody,
                parent: parent,
                move: "right"});
              break;
          }
          break;
      }
    }
    return moves;
  },

  computeRandomNextMove: function(){
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

  doMove: function(snake){
    console.log(this.moveQueue);
    if (this.moveQueue.length !== 0)
      snake.direction = this.moveQueue.shift();
    else
      this.inSearch = false;
  },

  atFood: function(parent){
    var pos = parent.pos.split(" ");
    var x   = parseInt(pos[0]);
    var y   = parseInt(pos[1]);

    var fo  = food.getPosition();
    var foX = fo[0];
    var foY = fo[1];

    console.log("Food is at : " + foX + " " + foY);

    return (x === foX && y === foY);
  }
};
