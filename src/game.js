// Game config
const MOVE_MS = 250;
const MAX_PLAYERS = 10;
const MAX_NAME_SIZE = 10;
const BLOCKS = 25;
const SNAKE_MIN_SIZE = 10;

const KEYS = {UP: 'v', DOWN: 'v', RIGHT: 'h', LEFT: 'h'};

const map = [];

class Node {

    constructor({i, j} = {i: -1, j: -1}) {
        this.i = i;
        this.j = j;
    }

    static mapPosition(i, j){
        i = (i<0)?BLOCKS+i:i%BLOCKS;
        j = (j<0)?BLOCKS+j:j%BLOCKS;
        return new Node({i, j});
    }

    equals(node) {
        return this.i == node.i && this.j == node.j;
    }

    markMap(value){
        const index = this.i*BLOCKS + this.j;
        map[index] = value;
    }

    fromIndex(index){
        this.j = index%BLOCKS;
        this.i = index/BLOCKS | 0;
    }
}

class Food extends Node {
    
    constructor(coords){
        super({i: (BLOCKS/2) | 0, j: (BLOCKS/2) | 0});
        this.eaten = false;
    }

    changePosition(){
        var index;
        do{
            index = Math.random()*(BLOCKS*BLOCKS) | 0;
        }
        while(map[index]);
        this.fromIndex(index);
        this.eaten = false;
    }
}

class Snake {

    constructor(){
        this.body = [];

        const i = Math.floor(Math.random()*BLOCKS);
        const j = Math.floor(Math.random()*BLOCKS);

        for(let c=0; c<SNAKE_MIN_SIZE; c++){
            let node = Node.mapPosition(i+c, j);
            node.markMap(true);
            this.addNode(node);
        }
    }

    addNode(node){
        this.body.push(node);
    }

    pop(){
        return this.body.pop();
    }

    move(direction){
        const head = this.body[0];
        var i, j;
        switch(direction){
            case 'UP':
                i = head.i - 1;
                j = head.j;
            break;
            case 'DOWN':
                i = head.i + 1;
                j = head.j;
            break;
            case 'RIGHT':
                i = head.i;
                j = head.j + 1;
            break;
            case 'LEFT':
                i = head.i;
                j = head.j - 1;
            break;
        }
        const node = Node.mapPosition(i, j);
        node.markMap(true);
        this.body.unshift(node);
    }

    collided(node){
        return this.body.find(cBody => {
            return cBody.equals(node);
        });
    }

    removeBody(){
        this.body.forEach(node => {
            node.markMap(false);
        });
    }
}

class Player{

    constructor(id, name){
        this.id = id;
        this.name = name;
        this.keyBuffer = [];
        // this.direction;
        this.safe = false;
        this.alive = true;
        this.fed = false;
        this.score = 0;
        // this.snake
        this.setHeadColor();
    }

    moveBody(){
        if(this.fed){
            this.fed = false;
        }
        else{
            this.snake.pop().markMap(false);
        }
        this.snake.move(this.direction);
    }

    collided(object){
        if(object instanceof Player){
            return object.snake.collided(this.getHead());
        }
        else{
            // Node
            return object.equals(this.getHead());
        }
    }

    selfCollided(){
        const head = this.getHead();
        return this.snake.body.slice(4).find(node => {
            return head.equals(node);
        });
    }

    setHeadColor(headColor){
        const color = headColor || {};
        if(!headColor){
            color.r = Math.random()*256 | 0;
            color.g = Math.random()*256 | 0;
            color.b = Math.random()*256 | 0;
            color.a = 1;
        }
        this.headColor = color;
    }

    getHead(){
        return this.snake.body[0];
    }

    keepSafe(ms){
        this.safe = true;
        setTimeout(() => {
            this.safe = false;
        }, 5000);
    }

    die(){
        this.snake.removeBody();
    }
}

Array.prototype.except = function(index) {
    const left = this.slice(0, index);
    const right = this.slice(index+1);
    return left.concat(right);
};

// Game vars
const players = [];
const queue = [];
const food = new Food();


module.exports = server => {

    const socketIO = require('socket.io');
    const io = socketIO(server);

    io.on('connection', client => {
        
        client.on('start', name => {

            if(!name.length || name.length > 10){
                return;
            }
            
            let found = queue.find(player => {
                return player.id == client.id;
            });
            if(found) return; // Player already in game

            found = players.find(player => {
                return player.id == client.id;
            });
            if(found) return; // Player already in game

            const player = new Player(client.id, name);
            queue.push(player);

            client.emit('started', {});
        });

        client.on('quit', () => {
            kick(client);
        });

        client.on('disconnect', () => {
            kick(client);
        });
    });

    // Game loop
    setInterval(async () => {
        
        await movePlayers();

        await checkCollisions();

        await removeDeadPlayers();

        moveQueue();

        if(food.eaten) food.changePosition();

        players.sort((player1, player2) => {
            return player2.score - player1.score;
        });
        io.sockets.emit('update', {players, queue, food});

    }, MOVE_MS);

    function kick(client){
        var deleted = queue.find((player, index) => {
            if(client.id == player.id){
                queue.splice(index, 1);
                return true;
            }
        });

        if (deleted) return;

        players.some((player, index) => {
            if(client.id == player.id){
                client.removeAllListeners('cmd');
                players.splice(index, 1)[0].die();
                return true;
            }
        });
    }

    async function movePlayers(){
        return new Promise(resolve => {
            if(players.length == 0){
                resolve();
                return;
            }
            var count = 0;
            players.forEach(async player => {

                // Consumes the keyBuffer
                while(player.keyBuffer.length > 0 && (player.keyBuffer[0] == player.direction || KEYS[player.keyBuffer[0]] == KEYS[player.direction])){
                    player.keyBuffer.shift();
                }
                player.direction = player.keyBuffer.shift() || player.direction;

                player.moveBody();

                count++;
                if(count == players.length) resolve();
            });
        });
    }

    async function checkCollisions(){
        return new Promise(resolve => {
            if(players.length == 0){
                resolve();
                return;
            }
            var count = 0;
            players.forEach(async (player, index) => {

                if(!player.safe){
                    // Check collision with another player
                    players.except(index).some(enemy => {
                        if(!enemy.safe && player.collided(enemy)){
                            player.alive = false;
                        }
                    });

                    // Check self collision
                    if(player.alive && player.selfCollided()){
                        player.alive = false;
                    }
                }

                // Check if player ate the food
                if(!food.eaten && player.alive && player.collided(food)){
                    player.fed = true;
                    player.score++;
                    food.eaten = true;
                }

                count++;
                if(count == players.length) resolve();
            });
        });
    }

    async function removeDeadPlayers(){
        return new Promise(resolve => {
            if(players.length == 0){
                resolve();
                return;
            }

            var count = 0;
            var removed = 0;
            players.forEach(async (player, index) => {
                if(!player.alive){
                    io.sockets.sockets[player.id].removeAllListeners('cmd');
                    const [dead] = players.splice(index - removed, 1);
                    player.die();
                    queue.push(dead);
                    removed++;
                }

                count++;
                if(count == players.length) resolve();
            });
        });
    }

    function moveQueue(){
        if(players.length < MAX_PLAYERS && queue.length > 0){
            const newPlayer = queue.shift();
            newPlayer.snake = new Snake();
            newPlayer.score = 0;
            newPlayer.alive = true;
            newPlayer.direction = 'UP';
            newPlayer.keepSafe();
            io.sockets.sockets[newPlayer.id].on('cmd', input => {
                newPlayer.keyBuffer.push(input);
            });
            players.push(newPlayer);
        }
    }
}