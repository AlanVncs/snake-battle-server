const canvas = document.getElementById('canvas');
const context = canvas.getContext("2d");

const BLACK_COLOR = {r: 0, g: 0, b: 0, a: 1};
const WHITE_COLOR = {r: 255, g: 255, b: 255, a: 1};

const CANVAS_SIZE = 500;
const BLOCKS = 25;
const BLOCK_SIZE = CANVAS_SIZE/BLOCKS;
const BLOCKS_T = BLOCKS*BLOCKS;

const DRAW_DELAY_MS = 10;

canvas.width  = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const MAP_SOURCE = Array.from(Array(BLOCKS_T), (e, index) => {
    let j = index%BLOCKS;
    let i = (index - j)/BLOCKS;
    return {i, j};
});

const mapCopy = [];
var paint = false;

setInterval(async () => {
    if(mapCopy.length != 0){
        const index = Math.random()*mapCopy.length | 0;
        const [block] = mapCopy.splice(index, 1);
        if(paint){
            let color = {};
            color.r = Math.random()*256 | 0;
            color.g = Math.random()*256 | 0;
            color.b = Math.random()*256 | 0;
            color.a = 1;
            setFillStyle(color);
        }
        drawBlock(block);
    }
    else{
        Object.assign(mapCopy, MAP_SOURCE);
        if(paint){
            setFillStyle(WHITE_COLOR);
        }
        paint = !paint;
    }
}, DRAW_DELAY_MS);

async function drawBlock({i, j}){
    context.fillRect(j*BLOCK_SIZE, i*BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function setFillStyle({r, g, b, a}){
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
}

function cmpColor({r1, g1, b1, a1}, {r2, g2, b2, a2}){
    return r1==r2 && g1==g2 && b1==b2 && a1==a2;
}