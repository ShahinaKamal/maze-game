// module aliases
const {Engine ,Render,Runner,World,Bodies,Body,Events} = Matter;

const width=window.innerWidth;
const height=window.innerHeight;
const cellsHorizontal=20;
const cellsVertical=16;
const unitLengthX=width/cellsHorizontal;
const unitLengthY=height/cellsVertical;
//create an engine
const engine=Engine.create();// run the engine
engine.world.gravity.y=0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);


/* // create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80); */
var walls = [
    Bodies.rectangle(width/2, 0, width, 4, { isStatic: true }),
    Bodies.rectangle(width/2, height, width, 4, { isStatic: true }),
    Bodies.rectangle(0, height/2, 4, height, { isStatic: true }),
    Bodies.rectangle(width, height/2, 4, height, { isStatic: true })
];
// add all of the bodies to the world
World.add(world, walls);

//shuffle neighbours
const shuffle = (arr) => {
    var length = arr.length;
    for (let i = 0; i < length; i++) {
        var randIndex = Math.floor(Math.random() * length);
        const temp = arr[i];
        arr[i] = arr[randIndex];
        arr[randIndex] = temp;//console.log("After+++++",arr[i], arr[randIndex]);
    }
    return arr;

}
//Maze generation
const grid=Array(cellsVertical)
    .fill(null)
    .map((item)=>Array(cellsHorizontal-1).fill(false));
    
const verticals=Array(cellsVertical)
    .fill(null)
    .map(()=>Array(cellsHorizontal-1).fill(false));

const horizontals=Array(cellsVertical-1)
    .fill(null)
    .map(()=>Array(cellsHorizontal).fill(false));

//Pick a random cells to start
let startRow=Math.floor(Math.random()*cellsVertical);
let startColumn=Math.floor(Math.random()*cellsHorizontal);

function stepThroughCell(row,column){
    //console.log("start row and column",row,column);
    //if i have visited this cell the return - this check can be skipped
    if (grid[row][column]){
            return;
        }
    //Mark this cell as being visited
    grid[row][column]=true;

    //assemble randomly-ordered list of neighbours
     let neighbours_coordinates=[
        [row,column-1,'left'],
        [row,column+1,'right'],
        [row-1,column,'above'],
        [row+1,column,'below']
     ]

     var neighbours=shuffle(neighbours_coordinates);
     //console.log(neighbours);
    //For each neighbours -
     for(let neighbour of neighbours){
        const [nextRow,nextColumn,direction]=neighbour;

       // console.log(neighbour);
     
        //see if neighbur is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical|| nextColumn<0 || nextColumn >= cellsHorizontal){
            continue;
        }

        //if we have visited that neighbour-go to next neighbour
         if (grid[nextRow][nextColumn]){
            continue;
        }                

        //remove the wall between cells that is either horizontal or vertical

         if(direction==='left'){
             verticals[row][column-1]=true;
         }
         else if(direction==='right'){
            verticals[row][column]=true;
        }
        else if(direction==='above'){
            horizontals[row-1][column]=true;
        }
        else if(direction==='below'){
            //console.log(row,column);
           // console.log("horizontals",horizontals);
           horizontals[row][column]=true;
           //console.log(horizontals)

        }
        //then visit the next cell and 
        stepThroughCell(nextRow,nextColumn);
     }

}


stepThroughCell(startRow,startColumn);
console.log(horizontals);
 horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) {
        return;
      }
  
      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX / 2,
        rowIndex * unitLengthY+ unitLengthY,
        unitLengthX,
        6,
        {
            label:'wall',
            isStatic: true,
            render:{
                fillStyle:'#296e6b'
            }
        }
      );
      World.add(engine.world, wall);
    });
  }); 


verticals.forEach((row,rowIndex)=>{
    console.log(row);
    row.forEach((open,columnIndex)=>{
        if(open)
        return;
        const wall=Bodies.rectangle(
            columnIndex*unitLengthX+unitLengthX,
            rowIndex*unitLengthY+unitLengthY / 2, 
            6,
            unitLengthY,                      
            {
                label:'wall',
                isStatic:true,
                render:{
                    fillStyle:'#296e6b'
                }
            }
        );
        World.add(world, wall);
    });
});
//Goal
const goal=Bodies.rectangle(width-unitLengthX/2,height-unitLengthY/2,unitLengthX*.7,unitLengthY*.7,
    {
        label:'goal',
        isStatic:true,
        render:{
            fillStyle:'#d3c732'
        }
    });
World.add(world,goal);

//Ball
const ballRadius=Math.min(unitLengthX,unitLengthY)/4;
const ball= Bodies.circle(
    unitLengthX / 2,
     unitLengthY / 2,
     ballRadius,{label:'ball',
     render:{
         fillStyle:'blue'
     }
    
    });
World.add(world,ball);

document.addEventListener('keydown',(event)=>{
    const {x,y}=ball.velocity;
    console.log(x,y);
    if(event.keyCode===38){
        Body.setVelocity(ball,{x,y:y-5});
    }
    if(event.keyCode===40){
        console.log("move ball down");
        Body.setVelocity(ball,{x,y:y+5});
    }
    if(event.keyCode===39){
        Body.setVelocity(ball,{x:x+5,y});
    }
    if(event.keyCode===37){
        Body.setVelocity(ball,{x:x-5,y});
    }
});

//Win condition-detect collision between circcle and goal
Events.on(engine,'collisionStart',(event)=>{
    event.pairs.forEach(collision=>{
        console.log(collision);
        let labels=['ball','goal'];
        if(labels.includes(collision.bodyA.label)&& labels.includes(collision.bodyB.label)){
            console.log("user won");
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y=1;
            world.bodies.forEach(body=>{
                if(body.label==='wall'){
                    Body.setStatic(body,false);
                }
            });

        }

    });

});
