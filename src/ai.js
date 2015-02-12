var canvas = document.getElementById("the-game");

Movement = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  CONTINUE: -1
}

//heuristic 1
function lineDistance(a, b)
{
  var xs = 0,
      ys = 0;

  xs = b.x - a.x;
  xs = xs * xs;

  ys = b.y - a.y;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}

//heuristic 2

//avg heuristic 1 and 2
function heuristicAverage(a, b)
{ }//return (lineDistance(a, b) + otherheuristic(a, b))/ 2; }

ai = {
  moveQueue: [],
  optionalMoves: [],
  inSearch: false,

  comparePosition: function(a, b) {
    if( a.pos === undefined || b.pos === undefined )
      return false;
    else
      return a.pos === b.pos;
  },

  init: function(){
    this.inSearch = false;
    this.moveQueue = [];
    this.optionalMoves = [];
  },

  addMove: function(move){
    this.moveQueue.unshift(move);
  },

  AStar: function() {
    var open = new PriorityQueue({ comparator: function(a, b){
      if (a.cost !== undefined && b.cost !== undefined)
        return a.cost - b.cost;
      return 0;
    }}),
       closed = [];

    var foodPos = food.getPosition(),
        snakePos = [Math.ceil(Math.floor(snake.x)/snake.size),
          Math.ceil(Math.floor(snake.y)/snake.size)];

    var pathLength = 0;

    open.queue({
      pos: snakePos[0] + " " + snakePos[1],
      body: snake.getPosition(),
      parent: undefined,
      cost: pathLength + lineDistance({x: foodPos[0], y: foodPos[1]},
        {x: snakePos[0], y: snakePos[1]}),
      move: snake.direction,
      path: pathLength});
    this.inSearch = true;

    while (open.length > 0)
    {
      var current = open.dequeue();

      if( this.atFood(current) )
      {
        console.log("success");
        var curParent = current.parent;
        while (curParent)
        {
          if ( curParent.parent !== undefined )
            this.addMove(curParent.move);
          curParent = curParent.parent;
        }

        var co = current.parent.pos.split(" ");
        var x = co[0],
            y = co[1];
        var fo = food.getPosition();

        if( !(x === fo[0] || y === fo[1]) )
        {
          if( x < 19 && current.move !== "right" )
            this.moveQueue.push(current.move);
        }

        return true;
      }
      else
      {
        ++pathLength;
        //get children
        this.getOptionalMoves(current);
        var nxtMoves = this.computeNextMoveCoordinates(current);
        //foreach child DO
        for(var i = 0; i < nxtMoves.length; i++)
        {
          var child    = nxtMoves[i],
              childPos = child.pos.split(" ");
              childX   = childPos[0],
              childY   = childPos[1];

          var onOpen = open.priv.data.getCompare(child, this.comparePosition),
              onClosed = closed.getCompare(child, this.comparePosition);

          if ( onOpen === undefined && onClosed === undefined )
          {
            //assign heuristic value
            child.cost = pathLength + lineDistance({x: childX, y: childY},
              {x: foodPos[0], y: foodPos[1]});
            child.path = pathLength;
            // add child to open
            open.queue(child);
          }
          // if the child is already on open
          else if (onOpen !== undefined)
          {
            //console.log(onOpen);
            // child was reached by shorter path
            if ( onOpen.path > child.path )
            {
              // give the state on open the shorter path value
              open.priv.data[open.priv.data.indexOf(onOpen)].path = child.path;
            }
          }
          // the child is already on closed
          else if (onClosed !== undefined)
          {
            //console.log(onClosed);
            // if the child was reached by a shorter path
            if( onClosed.path > child.path )
            {
              // remove it from closed and put it in open
              closed.splice(closed.indexOf(onClosed), 1);
              open.queue(child);
            }
          }
        }
        // put the current on closed
        closed.push(current);
        // reorder (should be done automatically)
      }
    }
    console.log("Failed");
    return false;
  },

  DFS: function() {
    var open = [],
        closed = [];

    open.push({pos: Math.ceil(Math.floor(snake.x)/snake.size) + " " +
      Math.ceil(Math.floor(snake.y)/snake.size),
      body: snake.getPosition(),
      parent: undefined,
      move: snake.direction});
    this.inSearch = true;

    while (open.length > 0)
    {
      var current = open.shift();

      if (this.atFood(current))
      {
        console.log("success");
        var curParent = current.parent;
        while (curParent)
        {
          if ( curParent.parent !== undefined )
            this.addMove(curParent.move);
          curParent = curParent.parent;
        }
        //console.log(food);
        var co = current.parent.pos.split(" ");
        var x = co[0],
            y = co[1];
        var fo = food.getPosition();

        if ( Math.abs(x - fo[0]) === 1 || Math.abs(y - fo[1]) === 1 )
          this.moveQueue.push(current.move);

        //console.log(current.parent);
        return true;
      }
      else
      {
        closed.push(current);
        this.getOptionalMoves(current);
        var nxtMoves = this.computeNextMoveCoordinates(current);

        for (var i = 0; i < nxtMoves.length; i++)
        {
          if( !open.compare(nxtMoves[i], this.comparePosition) &&
              !closed.compare(nxtMoves[i], this.comparePosition) )
            open.unshift(nxtMoves[i]);
        }
      }
    }
    console.log("failure");
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
        console.log('success'); //success
        //console.log(current);
        //build reverse tree
        var curParent = current.parent;
        while (curParent)
        {
          if ( curParent.parent !== undefined ) this.addMove(curParent.move);
          curParent = curParent.parent;
        }
        if (this.moveQueue.length === 1)
          this.moveQueue.push(current.move);
        return true;
      }
      else
      {
        closed.push(current);
        this.getOptionalMoves(current);
        var nxtMoves = this.computeNextMoveCoordinates(current);

        for(var i = 0; i < nxtMoves.length; i++)
        {
          if( !open.compare(nxtMoves[i], this.comparePosition) &&
              !closed.compare(nxtMoves[i], this.comparePosition) )
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

    var leftWall  = (x - 1) < 1;
    var rightWall = (x + 1) > 19;
    var upWall    = (y - 1) < 1;
    var downWall  = (y + 1) > 19;

    this.optionalMoves = [];
    switch (parent.move){
      case "up":
        //check left and right and up
        if( !(positions.contains(left) || leftWall) )
          this.optionalMoves.push(Movement.LEFT);
        if( !(positions.contains(right) || rightWall) )
          this.optionalMoves.push(Movement.RIGHT);
        if( !(positions.contains(up) || upWall) )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "down":
        //check left and right and down
        if( !(positions.contains(left) || leftWall) )
          this.optionalMoves.push(Movement.LEFT);
        if( !(positions.contains(right) || rightWall) )
          this.optionalMoves.push(Movement.RIGHT);
        if( !(positions.contains(down) || downWall) )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "left":
        //check up and down and left
        if( !(positions.contains(up) || upWall) )
          this.optionalMoves.push(Movement.UP);
        if( !(positions.contains(down) || downWall) )
          this.optionalMoves.push(Movement.DOWN);
        if( !(positions.contains(left) || leftWall) )
          this.optionalMoves.push(Movement.CONTINUE);
        break;

      case "right":
        //check up and down and right
        if( !(positions.contains(up) || upWall) )
          this.optionalMoves.push(Movement.UP);
        if( !(positions.contains(down) || downWall) )
          this.optionalMoves.push(Movement.DOWN);
        if( !(positions.contains(right) || rightWall) )
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

    newbody.shift();

    for(var i = 0; i < this.optionalMoves.length; i++)
    {
      var bod = newbody.slice();

      switch (this.optionalMoves[i])
      {
        case Movement.UP:
          // up
          bod.push(up);
          moves.push({pos: up,
            body: bod,
            parent: parent,
            move: "up",
            op: this.optionalMoves});
          break;
        case Movement.DOWN:
          // down
          bod.push(down);
          moves.push({pos: down,
            body: bod,
            parent: parent,
            move: "down",
            op: this.optionalMoves});
          break;
        case Movement.LEFT:
          //left
          bod.push(left);
          moves.push({pos: left,
            body: bod,
            parent: parent,
            move: "left",
            op: this.optionalMoves});
          break;
        case Movement.RIGHT:
          //right
          bod.push(right);
          moves.push({pos: right,
            body: bod,
            parent: parent,
            move: "right",
            op: this.optionalMoves});
          break;
        default:
          switch (parent.move)
          {
            case "up":
              bod.push(up);
              moves.push({pos: up,
                body: bod,
                parent: parent,
                move: "up",
                op: this.optionalMoves});
              break;
            case "down":
              bod.push(down);
              moves.push({pos: down,
                body: bod,
                parent: parent,
                move: "down",
                op: this.optionalMoves});
              break;
            case "left":
              bod.push(left);
              moves.push({pos: left,
                body: bod,
                parent: parent,
                move: "left",
                op: this.optionalMoves});
              break;
            case "right":
              bod.push(right);
              moves.push({pos: right,
                body: bod,
                parent: parent,
                move: "right",
                op: this.optionalMoves});
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
    if (this.moveQueue.length > 0)
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

    //console.log("Food is at : " + foX + " " + foY);

    return (x === foX && y === foY);
  }
};
