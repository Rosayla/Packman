class Ghost {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = 19;
        this.speed = 2;
        this.color = color;
        this.direction = this.randomPerpendicularDirection(); //direçao inicial aleatoria perpendicular
        this.isVulnerable = false; //sinal para verificar se o fantasma está vulneravel
        this.eyeOffsetX = 6; //deslocamento para movimento dos olhos
        this.eyeOffsetY = 4; //deslocamento para movimento dos olhos
        this.eyeSize = 4; //tamanho dos olhos
        this.mouthSize = 6; //tamanho da boca
        this.isSmiling = true; //sinal para controlar a expressao da boca

        //gerar posiçoes iniciais aleatorias dentro de uma area valida do labirinto
        const cellSize = min(width / mazeCols, height / mazeRows);
        let validPositions = [];
        for (let i = 0; i < maze.length; i++) {
            for (let j = 0; j < maze[i].length; j++) {
                if (maze[i][j] === ' ') { //verifica se a celula está vazia
                    validPositions.push(createVector(j * cellSize + cellSize / 2, i * cellSize + cellSize / 2));
                }
            }
        }
        //escolhe uma posiçao válida aleatoria
        let randomPosition = random(validPositions);
        this.x = randomPosition.x;
        this.y = randomPosition.y;

        //inicializa direçao vulneravel
        this.vulnerableDirection = null;

    }
    get isEatable() {
        return this.isVulnerable && dist(this.x, this.y, pacman.x, pacman.y) < this.radius + pacman.radius;
    }

    //DESENHO DOS FANTASMAS
    display() {
        fill(this.color);
        ellipse(this.x, this.y, this.radius * 2);

        //desenha olhos
        fill(255); //olhos brancos
        ellipse(this.x - this.eyeOffsetX, this.y - this.eyeOffsetY, this.eyeSize);
        ellipse(this.x + this.eyeOffsetX, this.y - this.eyeOffsetY, this.eyeSize);

        //desenhar boca
        if (this.isSmiling) {
            arc(this.x, this.y + 3, this.mouthSize, this.mouthSize, 0, PI); //arco sorridente
        } 
    }
    //FANTASMAS VULNERAVEIS (AZUIS) TEMPORIZADOR
    makeVulnerable() {
        this.color = "blue"; //muda cor do fantasma para azul
        this.isVulnerable = true; //define sinal de vulnerável como verdadeiro
    
        setTimeout(() => {
            this.color = "red"; //muda a cor do fantasma de volta para vermelho
            this.isVulnerable = false; //define sinal de vulneravel de volta para falso
            this.vulnerableDirection = null; //resetaa direçao vulneravel
        }, 10000); //10 segundos em milissegundos
    }

    //COMPORTAMENTO DOS FANTASMAS VULNERAVEIS
    chooseNextDirection() {
        //se estiver vulnerável (azul), escolha a direçao que leva mais longe do pacman
        if (this.isVulnerable) {
            let maxDistance = -Infinity;
            let bestDirection = null;
            for (let dir of [createVector(0, 1), createVector(0, -1), createVector(1, 0), createVector(-1, 0)]) {
                let nextX = this.x + dir.x * this.speed;
                let nextY = this.y + dir.y * this.speed;
                if (!this.collidesWithWalls(nextX, nextY)) {
                    let distance = dist(nextX, nextY, pacman.x, pacman.y);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        bestDirection = dir;
                    }
                }
            }
            return bestDirection;
        } else {
            //caso contrario, escolha a próxima direçao disponivel que nao colide com a parede
            let availableDirections = [];
            for (let dir of [createVector(0, 1), createVector(0, -1), createVector(1, 0), createVector(-1, 0)]) {
                let nextX = this.x + dir.x * this.speed;
                let nextY = this.y + dir.y * this.speed;
                if (!this.collidesWithWalls(nextX, nextY)) {
                    availableDirections.push(dir);
                }
            }
            return random(availableDirections);
        }
    }
    //MOVIMENTO NORMAL E COLISOES
    move() {
        if (this.isVulnerable) {
            //se estiver vulnerável (azul), escolha a direçao que leva mais longe do pacman
            let nextDirection = this.chooseNextDirection();
            this.direction = nextDirection;
    
            //movimenta se na nova direçao escolhida
            this.x += this.direction.x * this.speed;
            this.y += this.direction.y * this.speed;
        } else {
            //caso contrario, move se normalmente
            let nextX = this.x + this.direction.x * this.speed;
            let nextY = this.y + this.direction.y * this.speed;
    
            let collidesWithWall = false;
            for (let wall of walls) {
                if (wall.collides(nextX, nextY, this.radius)) {
                    collidesWithWall = true;
                    break;
                }
            }
    
            let adjacentSpaces = [];
            for (let dir of [createVector(0, 1), createVector(0, -1), createVector(1, 0), createVector(-1, 0)]) {
                let newX = this.x + dir.x * this.speed;
                let newY = this.y + dir.y * this.speed;
                if (!this.collidesWithWalls(newX, newY)) {
                    adjacentSpaces.push(dir);
                }
            }
    
            if (collidesWithWall && adjacentSpaces.length > 0) {
                let bestDirection = adjacentSpaces[0];
                let bestDistance = dist(this.x + bestDirection.x * this.speed, this.y + bestDirection.y * this.speed, pacman.x, pacman.y);
                for (let dir of adjacentSpaces) {
                    let distance = dist(this.x + dir.x * this.speed, this.y + dir.y * this.speed, pacman.x, pacman.y);
                    if (distance < bestDistance) {
                        bestDirection = dir;
                        bestDistance = distance;
                    }
                }
                this.direction = bestDirection;
            } else if (!collidesWithWall) {
                this.x = nextX;
                this.y = nextY;
            }
    
            if (this.x < -this.radius) {
                this.x = width + this.radius;
            } else if (this.x > width + this.radius) {
                this.x = -this.radius;
            }
        }
    }
    collidesWithWalls(x, y) {
        for (let wall of walls) {
            if (wall.collides(x, y, this.radius)) {
                return true;
            }
        }
        return false;
    }

    randomPerpendicularDirection() {
        //gera uma direçao perpendicular aleatoria (cima, baixo, esquerda, direita)
        const directions = [createVector(0, 1), createVector(0, -1), createVector(1, 0), createVector(-1, 0)];
        return random(directions);
    }
}
