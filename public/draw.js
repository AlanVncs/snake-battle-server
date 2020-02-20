const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const tdColor = document.querySelectorAll('table#scoreboard tbody td:nth-child(1) div');
const tdNames = document.querySelectorAll('table#scoreboard tbody td:nth-child(2)');
const tdScores = document.querySelectorAll('table#scoreboard tbody td:nth-child(3)');
const tbodyQueue = document.querySelector('table#queue tbody');

const GRID_COLOR = {r: 0, g: 0, b: 0, a: 0.4};
const MY_HEAD_COLOR = {r: 255, g: 100, b: 100, a: 1};
const MY_BODY_COLOR = {r: 150, g: 100, b: 100, a: 1};
const ENEMY_BODY_COLOR = {r: 100, g: 100, b: 100, a: 0.7};
const FOOD_COLOR = {r: 65, g: 185, b: 28, a: 1};

const CANVAS_SIZE = 500;
const BLOCKS = 25;
const BLOCK_SIZE = CANVAS_SIZE/BLOCKS;

var drawFlag = true;

canvas.width  = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
drawGrid();

function drawGame(data){
    requestAnimationFrame(() => {
        drawFlag = !drawFlag;
        clearAllNodes();
        drawFood(data.food);
        data.players.forEach(player => {
            drawBody(player);
        });
    });
}

function drawStatus(data){
    requestAnimationFrame(() => {
        const players = data.players;
        var index = 0;
        while(index < players.length){
            let player = players[index];
            const headColor = player.me?MY_HEAD_COLOR:player.headColor;
            tdColor[index].style.backgroundColor = `rgba(${headColor.r}, ${headColor.g}, ${headColor.b}, ${headColor.a})`;
            tdColor[index].style.borderWidth = '1px';
            tdNames[index].innerText = player.name;
            tdScores[index].innerText = player.score;
            index++;
        }
        while(index < tdColor.length){
            tdColor[index].style.backgroundColor = 'transparent';
            tdColor[index].style.borderWidth = '0px';
            tdNames[index].innerText = '-';
            tdScores[index].innerText = '-';
            index++;
        }

        tbodyQueue.innerHTML = '';
        data.queue.forEach(player => {
            const tr = document.createElement("tr");
            const div = document.createElement('div');
            const tdColor = document.createElement('td');
            const tdName = document.createElement('td');
            const tdNumber = document.createElement('td');
            tdColor.append(div);
            tdName.innerText = player.name;
            tr.append(tdColor);
            tr.append(tdName);
            tr.append(tdNumber);
            tbodyQueue.append(tr);
        });
    });
}

async function drawBody(player){

    const headColor = {};
    const bodyColor = {};

    if(player.me){
        Object.assign(headColor, MY_HEAD_COLOR);
        Object.assign(bodyColor, MY_BODY_COLOR);
    }
    else{
        Object.assign(headColor, player.headColor);
        Object.assign(bodyColor, ENEMY_BODY_COLOR);
    }

    if(player.safe && drawFlag){
        headColor.a = bodyColor.a = 0.3;
    }
    
    setFillStyle(bodyColor);
    for(i=1; i<player.snake.body.length; i++){
        drawNode(player.snake.body[i]);
    }

    setFillStyle(headColor);
    await drawNode(player.snake.body[0]);
}

async function drawNode(node){
    context.fillRect(node.j*BLOCK_SIZE + 2, node.i*BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
}

async function drawFood(node){
    setFillStyle(FOOD_COLOR);
    context.beginPath();
    context.arc(node.j*BLOCK_SIZE + BLOCK_SIZE/2, node.i*BLOCK_SIZE + BLOCK_SIZE/2, BLOCK_SIZE*0.3, 0, 2*Math.PI);
    context.fill();
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

function setFillStyle({r, g, b, a}){
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
}

function setStrokeStyle({r, g, b, a}){
    context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
}