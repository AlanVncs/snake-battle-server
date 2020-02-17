// Game config
const MOVE_MS = 500;
const MAX_PLAYERS = 10;
const MAX_NAME_SIZE = 10;
const BLOCKS = 25;

// Game vars
const players = [];
const queue = [];

class Node {
    
    constructor({i, j}) {
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
}

class Snake {

    constructor(){
        this.body = [];

        const i = Math.floor(Math.random()*BLOCKS);
        const j = Math.floor(Math.random()*BLOCKS);

        this.addNode(Node.mapPosition(i, j));
        this.addNode(Node.mapPosition(i+1, j));
        this.addNode(Node.mapPosition(i+2, j));
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
        this.body.unshift(node);
    }
}

class Player{
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.keyBuffer = [];
        this.direction = 'UP';
        this.safe = true;
        this.alive = true;
        this.fed = false;
        this.snake = new Snake();
    }

    moveBody(){
        if(this.fed){
            this.fed = false;
        }
        else{
            this.snake.pop();
        }
        this.snake.move(this.direction);
    }
}


module.exports = server => {
    const socketIO = require('socket.io');
    const io = socketIO(server);

    io.on('connection', client => {
        console.log(`New client: ${client.id}`);

        // TODO Verificar o nome
        client.on('play', name => {
            const player = new Player(client.id, name);
            queue.push(player);
        });

        

        client.on('disconnect', () => {
            var deleted = false;

            queue.some((player, index) => {
                if(client.id == player.id){
                    deleted = true;
                    queue.splice(index, 1);
                    return true;
                }
            });

            if (deleted) return;

            players.some((player, index) => {
                if(client.id == player.id){
                    deleted = true;
                    players.splice(index, 1);
                    return true;
                }
            });

        });
    });


    // Game loop
    setInterval(async () => {

        // Move players and check self collision
        await movePlayers();

        // Check mutual collisions and if a snake was fed
        // await checkCollisions();

        // Remove players

        // Broadcast state
        io.sockets.emit('update', {players});

        // Move queue
        const newPlayers = queue.splice(0, MAX_PLAYERS - players.length);
        players.push(...newPlayers);

    }, MOVE_MS);

    async function movePlayers(){
        return new Promise(resolve => {
            if(players.length == 0){
                resolve();
                return;
            }
            var count = 0;
            players.forEach(async player => {
                // Checar keybuffer

                // Move player
                player.moveBody();

                // Check self collision

                count++;
                if(count == players.length) resolve();
            });
        });
    }
}