const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");

const GRID_COLOR = {r: 0, g: 0, b: 0, a: 0.4};
const HEAD_COLOR = {r: 255, g: 100, b: 100, a: 1};
const BODY_COLOR = {r: 100, g: 150, b: 150, a: 1};

const KEYS = {87: 'UP', 83: 'DOWN', 68: 'RIGHT', 65: 'LEFT'};

const CANVAS_SIZE = 500;
const BLOCKS = 25;
const BLOCK_SIZE = CANVAS_SIZE/BLOCKS;

// Initialize
canvas.width  = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
drawGrid();

const socket = io();

socket.emit('play', 'AlanVncs');

socket.on('update', ({players}) => {
    clearAllNodes();
    // drawFood(food);
    players.forEach(player => {
        if(player.alive){
            drawBody(player);
            // if(snake.id == clientID){
            //     drawSnake(snake);
            // }
            // else{
            //     drawEnemySnake(snake);
            // }
        }
    });
});

async function drawBody(player){

    const headColor = {};
    const bodyColor = {};

    Object.assign(headColor, HEAD_COLOR);
    Object.assign(bodyColor, BODY_COLOR);

    if(player.safe){
        headColor.a = 0.5;
        bodyColor.a = 0.5;
    }
    
    setFillStyle(headColor);
    await drawNode(player.snake.body[0]);

    setFillStyle(bodyColor);
    for(i=1; i<player.snake.body.length; i++){
        drawNode(player.snake.body[i]);
    }
}

async function drawNode(node){
    context.fillRect(node.j*BLOCK_SIZE + 2, node.i*BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
}

function clearAllNodes(){
    for(i=0; i<BLOCKS; i++){
        for(j=0; j<BLOCKS; j++){
            context.clearRect(j*BLOCK_SIZE + 2, i*BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        }
    }
}

function drawGrid(){
    setStrokeStyle(GRID_COLOR);
    for(i=0; i<BLOCKS; i++){
        for(j=0; j<BLOCKS; j++){
            context.strokeRect(j*BLOCK_SIZE, i*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);   
        }
    }
}

function setFillStyle({r, g, b, a} = DEFAULT_COLOR){
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
}

function setStrokeStyle({r, g, b, a} = DEFAULT_COLOR){
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
}



// const canvas = document.getElementById('canvas');
// const context = canvas.getContext("2d");

// const BLACK_COLOR = {r: 0, g: 0, b: 0, a: 1};
// const WHITE_COLOR = {r: 255, g: 255, b: 255, a: 1};

// const CANVAS_SIZE = 500;
// const BLOCKS = 25;
// const BLOCK_SIZE = CANVAS_SIZE/BLOCKS;
// const BLOCKS_T = BLOCKS*BLOCKS;

// const DRAW_DELAY_MS = 1000;

// canvas.width  = CANVAS_SIZE;
// canvas.height = CANVAS_SIZE;

// const MAP_SOURCE = Array.from(Array(BLOCKS_T), (e, index) => {
//     let j = index%BLOCKS;
//     let i = (index - j)/BLOCKS;
//     return {i, j};
// });

// const mapCopy = [];
// var paint = false;

// setInterval(async () => {
//     if(mapCopy.length != 0){
//         const index = Math.random()*mapCopy.length | 0;
//         const [block] = mapCopy.splice(index, 1);
//         if(paint){
//             let color = {};
//             color.r = Math.random()*256 | 0;
//             color.g = Math.random()*256 | 0;
//             color.b = Math.random()*256 | 0;
//             color.a = 1;
//             setFillStyle(color);
//         }
//         drawBlock(block);
//     }
//     else{
//         Object.assign(mapCopy, MAP_SOURCE);
//         if(paint){
//             setFillStyle(WHITE_COLOR);
//         }
//         paint = !paint;
//     }
// }, DRAW_DELAY_MS);

// async function drawBlock({i, j}){
//     context.fillRect(j*BLOCK_SIZE, i*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
// }

// function setFillStyle({r, g, b, a}){
//     context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
// }

// function cmpColor({r1, g1, b1, a1}, {r2, g2, b2, a2}){
//     return r1==r2 && g1==g2 && b1==b2 && a1==a2;
// }