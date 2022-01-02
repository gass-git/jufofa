// Interface constants
const canvas = document.getElementById("root"),
      pauseBtn = document.getElementById("pause"),
      resumeBtn = document.getElementById("resume"),
      scoreDiv = document.getElementById("score"),
      startBtn = document.getElementById("start"),
      ctx = canvas.getContext("2d");

// Color constants    
// Joker +0 (light-blue), grey rock +1 (light black), copper +2 (brown) 
// silver +3 (grey), gold +4 (yellow), ruby +5 (red)
const jokerColor = "#D6E5FA",
      greyRockColor = "#595260",
      copperColor = "#DE834D",
      silverColor = "#D8E3E7",
      goldColor = "#FFCE45",
      rubyColor = "#F05454",
      bombColor = "#2C272E",
      colors = [jokerColor, greyRockColor, copperColor],
      colorsToAdd = [silverColor, goldColor, rubyColor],
      framesToAddColor = 6000; // 100 equals 1 second

const points = [0,1,2,3,4,5];

// General game constants      
const pieceWidth = 40,
      bombRadius = 40,
      numberOfColumns = canvas.width/pieceWidth,
      positions_x_axis = [],
      speed = 1, // IMPORTANT: speed and boost must be multiples of 2
      boost = 6,
      isBoostEnabled = true;

// Populate positions_x_axis array      
for(let i = 0; i < numberOfColumns; i++){
  positions_x_axis.push(pieceWidth*i);
}

// Movement variables
var right = false,
    left = false,
    down = false;

// Other global variables   
var score = 0,
    timeOut = false,
    pieces = [],
    frames = 0,
    addedColorsCount = 0;

class piece {
  constructor(type, pieceColor){
    this.type = type,
    this.width = pieceWidth,
    this.color = pieceColor,
    this.x = positions_x_axis[2],
    this.y = 0,
    this.isMoving = true,
    this.isActive = true
  }
}

function main(){
  // Count the frames
  frames++;

  // Create a piece if there are no pieces
  if(pieces.length === 0){
    firstPieceCreate = true;
    pieces.push(new piece("square", randomColor())); 
  }
  

  // When frames reach a certain amount push a new color to the colors array.
  // Note: this is to make the game harder as it progresses.
  if(frames === framesToAddColor && colors.length < 6){
    colors.push(colorsToAdd[addedColorsCount]);
    addedColorsCount++;
    frames = 0;
  }

  // Create a new piece if the last one is not active.  
  let numberOfPieces = pieces.length,
      lastPiece = pieces[numberOfPieces - 1];

  // If there are more than 5 pieces in the game, bombs have a chance of 30% to be created.        
  if(lastPiece.isActive === false && numberOfPieces <= 5){
    pieces.push(new piece("square", randomColor())); 
  }
  else if(lastPiece.isActive === false && numberOfPieces > 5){
    // Check if it is game over before creating a new piece.
    if(lastPiece.y === 0 && lastPiece.isMoving === false){
      gameOver();
    }else{
      Math.random() <= 0.3 ? pieces.push(new piece("bomb", bombColor)) : pieces.push(new piece("square", randomColor()));
    }
  }

  scoreDiv.innerHTML = score;
  ctx.clearRect(0,0,canvas.width, canvas.height);

  pieces.forEach((piece) => {
    
    drawPiece(
      piece.type,
      piece.x,
      piece.y,
      piece.color
    );
    
    // Falling effect
    let col = positions_x_axis.indexOf(piece.x),
        pieceBottomPosY = piece.y + piece.width;

    if(pieceBottomPosY <= availableHeight(col)){
      if(down && piece.isActive && pieceBottomPosY + speed*boost < availableHeight(col)){
        piece.y += speed*boost;
      }else{
        piece.y += speed;
      }
    }else{
      piece.isMoving = false;
      piece.isActive = false;
    }

    /* 
      HORIZONTAL MOVEMENT
    */
    if(left && piece.isActive){
       // Does the piece have a column available to the left?
      if(piece.x !== positions_x_axis[0]){
        if(isLeftAvailable(piece) && timeOut === false){
          let i = positions_x_axis.indexOf(piece.x); 
          piece.x = positions_x_axis[i - 1];
          timeOut = true;
          setTimeout(()=>{ timeOut = false },120)
        }
      }
    }

    if(right && piece.isActive){
      // Does the piece have a column available to the right?
      if(piece.x !== positions_x_axis[positions_x_axis.length - 1]){
        if(isRightAvailable(piece) && timeOut === false){
          let i = positions_x_axis.indexOf(piece.x);
          piece.x = positions_x_axis[i + 1];
          timeOut = true;
          setTimeout(()=>{ timeOut = false },120)
        }
      }  
    }

  });

  lastPiece = pieces[pieces.length - 1];
  if(lastPiece.type === "bomb" && lastPiece.isMoving === false){
    let bomb = lastPiece;

    // Remove the left piece if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x - pieceWidth && p.y === bomb.y){
        return false;
      }else{
        return true;
      }
    });

    // Remove the right piece if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x + pieceWidth && p.y === bomb.y){
        return false;
      }else{
        return true;
      }
    });

     // Remove the bottom piece if exists
     pieces = pieces.filter((p) => { 
      if(p.x === bomb.x && p.y === bomb.y + pieceWidth){
        return false;
      }else{
        return true;
      }
    });

    // Remove the top piece if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x && p.y === bomb.y - pieceWidth){
        return false;
      }else{
        return true;
      }
    });

    // Remove the diagonal left-top if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x - pieceWidth && p.y === bomb.y - pieceWidth){
        return false;
      }else{
        return true;
      }
    })

    // Remove the diagonal left-bottom if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x - pieceWidth && p.y === bomb.y + pieceWidth){
        return false;
      }else{
        return true;
      }
    })

    // Remove the diagonal right-top if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x + pieceWidth && p.y === bomb.y - pieceWidth){
        return false;
      }else{
        return true;
      }
    })

    // Remove the diagonal right-bottom if exists
    pieces = pieces.filter((p) => { 
      if(p.x === bomb.x + pieceWidth && p.y === bomb.y + pieceWidth){
        return false;
      }else{
        return true;
      }
    })

    // Remove the bomb
    pieces = pieces.filter((p) => { 
      if(p.type === bomb.type){
        return false;
      }else{
        return true;
      }
    })

    /* Important: when pieces are removed all other pieces
          that where above them will move */
    for(const s of pieces){
      s.isMoving = true;
    }

  }else{
    let count = 0;
    let colorsInRow = [];
    for(let a = 0; a < pieces.length; a++){
      colorsInRow = [];
      for(let b = a+1; b < pieces.length; b++){
        // Compare only if neither of the pieces are moving
        if(pieces[a].isActive === false && pieces[b].isActive === false){
          // Are pieces in the same row?
          if(Math.floor(pieces[a].y) === Math.floor(pieces[b].y)){
            // If the colorsInRow array is empty add pieces[a]
            // Note: is important to add this piece only once because it repeats inside this loop
            if(colorsInRow.length < 1){
              colorsInRow.push(pieces[a].color);
            }
            colorsInRow.push(pieces[b].color);
            count++;
          }
        }
      }

      let colorCount = 0, removeRow = false, jokersCount = 0;

      // Count jokers in this column
      colorsInRow.forEach((color) => {
        color === jokerColor ? jokersCount++ : null
      })

      // Remove row ?
      colors.forEach((color) => {
        for(const pieceColor of colorsInRow){
          color === pieceColor && color !== jokerColor ? colorCount++ : null;
        }
        colorCount + jokersCount === numberOfColumns ? removeRow = true : colorCount = 0;
      })
      
      if(removeRow){
        // Remove aligned pieces of the same color
        pieces = pieces.filter(p => Math.floor(p.y) !== Math.floor(pieces[a].y));

        // Add points to total score
        colorsInRow.forEach((color) => {
          score += points[colors.indexOf(color)];
        })
        
        
        /* Important: when pieces are removed all other pieces
          that where above them will move */
        for(const s of pieces){
          s.isMoving = true;
        }
        break;
      }else{
        count = 0; // reset counter
      }
    }
  }

  
      
}

function randomColor(){
  let rand = Math.round(Math.random() * (colors.length - 1));
  return colors[rand];
}

function gameOver(){
  alert('Game Over');
  interval = clearInterval(interval);
  startBtn.innerText = "start game";
}

// Columns {0,1,2, .... }
function availableHeight(col){
  let occupied = 0;
  // Sum up the pixels been occupied on a column
  pieces.forEach((piece) => {
    if(piece.x === positions_x_axis[col]){
      if(piece.isMoving === false && piece.isActive === false){
        occupied += pieceWidth;
      }  
    }
  });
  return (canvas.height - occupied);
}

function isRightAvailable(movingpiece){
  let heightOccupied = 0,
      rightCol = positions_x_axis.indexOf(movingpiece.x) + 1;

  /* 
    Check if there are piece to the right side and if so
    get the height been occupied by them.
  */  
  pieces.forEach((s) => {
    if(s.x === positions_x_axis[rightCol] && s.isActive === false){
      heightOccupied += s.width;
    }
  });

  // Can the active piece move to the right?
  if(movingpiece.y + movingpiece.width < canvas.height - heightOccupied){
    return true;
  } else{
    return false;
  }
}

function isLeftAvailable(movingpiece){
  let heightOccupied = 0,
      leftCol = positions_x_axis.indexOf(movingpiece.x) - 1;

  /* 
    Check if there are piece to the left side and if so
    get the height been occupied by them.
  */     
  pieces.forEach((s) => {
    if(s.x === positions_x_axis[leftCol] && s.isActive === false){
      heightOccupied += s.width;
    }
  });

  // Can the active piece move to the left?
  if(movingpiece.y + movingpiece.width < canvas.height - heightOccupied){
    return true;
  } else{
    return false;
  }
}

function handleKeyDown(e){
  if(e.key === "Right" || e.key === "ArrowRight"){
    right = true;
  }
  if(e.key === "Left" || e.key === "ArrowLeft"){
    left = true;
  }
  if(e.key === "Down" || e.key === "ArrowDown"){
    down = true;
  }
}

function handleKeyUp(e){
  if(e.key === "Right" || e.key === "ArrowRight"){
    right = false;
  }
  if(e.key === "Left" || e.key === "ArrowLeft"){
    left = false;
  }
  if(e.key === "Down" || e.key === "ArrowDown"){
    down = false;
  }
}

function drawPiece(type, posX, posY, color){
  ctx.beginPath();
  
  if(color === jokerColor){
    ctx.rect(posX, posY, pieceWidth, pieceWidth);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.font= "30px Helvetica";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.fillText("J", posX + 12, posY + pieceWidth - 8);
  }else{
    let radius = pieceWidth/2;
    
    switch(type){
      case "square": 
      ctx.rect(posX, posY, pieceWidth, pieceWidth);
      ctx.fillStyle = color;
      ctx.fill();
      break;

      case "bomb":
      ctx.arc(posX + radius, posY + radius, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
      break;
    }
  }
  ctx.closePath();
}

var interval;

startBtn.addEventListener("click", () => {
  if(startBtn.innerText === "start game"){
    if(pieces.length > 0){
      pieces = [];
    }
    interval = setInterval(main, 10);
    startBtn.innerText = "game started";
  }
});
pauseBtn.addEventListener("click", () => {
  if(pauseBtn.innerText === "pause"){ 
    pauseBtn.innerText = "resume"; 
    interval = clearInterval(interval);
  }else{
    pauseBtn.innerText = "pause";
    interval = setInterval(main, 10);
  }
});
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);