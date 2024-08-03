//VARIAVEIS E CONSTANTES
let pacman;
let pellets = [];
let specialPellets = []
let score = 0;
let lives = 3;
let gameState = "start"; //possiveis estados: start, playing, paused, gameover
let maze;
const mazeRows = 13; //numero de linhas do labirinto
const mazeCols = 17; //numero de colunas do labirinto
const availableColors = ["pink", "red", "purple", "green"]; //cores para os fantasmas
let pacmanCanvas; //declara uma variavel para armazenar o canvas p5.js
let walls = []; //array para armazenar objetos de parede
let gameWon = false; //variavel global para controlar se o jogo foi ganho
let numGhostsToAdd = 1;

//TAMANHO DO CANVAS
function setup() {
    pacmanCanvas = createCanvas(784, 600); //atribui o canvas a pacmanCanvas
    pacmanCanvas.id('pacmanCanvas'); //define o ID do canvas como "pacmanCanvas"
    initMaze();
}

//LOOP DO DESENHO DO JOGO
function draw() {
    background(0);
    drawMaze(); //chama a funçao drawMaze
    if (gameState === "start") {
        startScreen();
    } else if (gameState === "playing") {
        playGame();
    } else if (gameState === "paused") {
        pauseScreen();
    } else if (gameState === "gameover") {
        gameOverScreen();
    } else if (gameState === "win") {
        winScreen();
    }

    // mostrar pontuacao e vidas
    displayScore();
    displayLives();
}

//OBTER COR QUALQUER
function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
}

//LABIRINTO
function initMaze() {

    maze = [
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '2', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
        ['-', ' ', '1', '1', '1', ' ', '1', '1', '1', '1', '1', ' ', '1', '1', '1', ' ', '-'],
        ['-', ' ', '1', ' ', ' ', ' ', '1', ' ', ' ', ' ', '1', ' ', ' ', ' ', '1', ' ', '-'],
        ['-', ' ', '1', ' ', '1', ' ', ' ', ' ', '1', ' ', ' ', ' ', '1', ' ', '1', ' ', '-'],
        ['-', ' ', '1', '2', '1', ' ', '1', ' ', ' ', ' ', '1', ' ', '1', ' ', '1', '2', '-'],
        ['-', ' ', ' ', ' ', '1', ' ', '1', '1', '+', '1', '1', ' ', '1', ' ', '1', ' ', '-'],
        ['-', ' ', '1', ' ', '1', ' ', ' ', '1', ' ', '1', ' ', ' ', '1', ' ', '1', ' ', '-'],
        ['-', ' ', '1', ' ', '1', '1', ' ', '1', ' ', '1', ' ', '1', '1', ' ', '1', ' ', '-'],
        ['-', ' ', '1', ' ', ' ', ' ', ' ', '1', ' ', '1', ' ', ' ', ' ', ' ', '1', ' ', '-'],
        ['-', ' ', '1', ' ', '1', ' ', '1', '1', ' ', '1', '1', ' ', '1', ' ', '1', ' ', '-'],
        ['-', ' ', ' ', ' ', '1', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '1', ' ', ' ', ' ', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
    ];
    ghosts = [];
    const cellSize = min(width / mazeCols, height / mazeRows);
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === '-') { //celula de parede estática
                walls.push(new Wall(j * cellSize, i * cellSize, cellSize, cellSize));
            } else if (maze[i][j] === ' ') { //gera pellet para celulas vazias
                pellets.push(new Pellet(j * cellSize + cellSize / 2, i * cellSize + cellSize / 2));            
            }else if (maze[i][j] === '2'){//gera pellets especiais em celulas '2'
                specialPellets.push(new SpecialPellet(j * cellSize + cellSize / 2, i * cellSize + cellSize / 2));
            }

            if (maze[i][j] === '1' && random() > 0.5) { //substituir '1' por parede aleatoriamente
                walls.push(new Wall(j * cellSize, i * cellSize, cellSize, cellSize));
                maze[i][j] = '-';
            }
        }
    }

    pacman = new Pacman((mazeCols / 2) * cellSize, (mazeRows / 2) * cellSize);
    ghosts.push(new Ghost(100, 100, "red"));
    ghosts.push(new Ghost(300, 300, "pink"));
    if (gameWon) { //verifica se o jogo foi ganho após a inicializaçao
        //adiciona fantasmas adicionais com cores aleatórias
        for (let i = 0; i < numGhostsToAdd; i++) {
            ghosts.push(new Ghost(random(width), random(height), getRandomColor()));
        }
        //aumenta o número de fantasmas a serem adicionados na próxima vitória
        numGhostsToAdd++;
        gameWon = false;
    }
    score = 0;
    lives = 3;
}

//VERIFICACAO SE OS FANTASMAS FORAM COMIDOS
function areGhostsEaten() {
    return ghosts.length === 0; // Retorna verdadeiro se nao houver fantasmas na lista
}

//ECRÃ DE INICIO DO JOGO
function startScreen() {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text("Pressione ENTER para Iniciar", width / 2, height / 2);
}

//JOGABILIDADE
function playGame() {
    pacman.move();
    pacman.display();

    //PELLETS
    for (let i = 0; i < pellets.length; i++) {
        pellets[i].display();
        if (pacman.eats(pellets[i])) {
            pellets.splice(i, 1);
            score++;
        }
    }

    //PELLETS ESPECIAIS
    for (let i = 0; i < specialPellets.length; i++) {
        specialPellets[i].display();
        if (pacman.eats(specialPellets[i])) {
            specialPellets.splice(i, 1);
            // fazer os fantasmas ficarem vulneraveis por 10 segundos
            for (let ghost of ghosts) {
                ghost.makeVulnerable();
            }
        }
    }
    
    //FANTASMAS
    for (let ghost of ghosts) {
        ghost.move();
        ghost.display();
        if (pacman.hits(ghost) && !ghost.isVulnerable) {
            lives--;
            if (lives === 0) {
                gameState = "gameover";
            } else {
                pacman.reset();
            }
        } else if (ghost.isEatable) {
            //se o fantasma for vulneravel e estiver perto o suficiente do pacman
            ghosts.splice(ghosts.indexOf(ghost), 1); // remove o fantasma da lista de fantasmas
            score += 200; //aumenta o score ao comer o fantasma
        }
    }

    //DEFINIR QUANDO O JOGO FOI GANHO
    if (pellets.length === 0 || ghosts.length === 0) {
        gameState = "win";
        gameWon = true; //define que o jogo foi ganho
    }

    // VERIFICA SE O JOGO FOI PERDIDO APÓS GANHAR UM JOGO
    if (gameState === "gameover") {
        numGhostsToAdd = 1; //reseta o numero de fantasmas a serem adicionados
        gameWon = false; //reseta o status de jogo ganho
    }
}

//ECRA PARA PAUSA DO JOGO
function pauseScreen() {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text("Game Paused", width / 2, height / 2);
}

//ECRÃ PARA FIM DO JOGO
function gameOverScreen() {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text("Fim do Jogo", width / 2, height / 2 - 40);
    text("Pontuação: " + score, width / 2, height / 2);
    text("Pressione ENTER para Reiniciar", width / 2, height / 2 + 40);
}

//ECRA DE VITORIA
function winScreen() {
    textSize(32);
    fill(255);
    textAlign(CENTER);
    text("Ganhaste!", width / 2, height / 2 - 40);
    text("Pontuação: " + score, width / 2, height / 2);
    text("Pressione ENTER para Reiniciar", width / 2, height / 2 + 40);
}

//TECLAS PRESSIONADAS
function keyPressed() {
    if (gameState === "playing") {
        pacman.handleKeyPress();
    } else if (keyCode === ENTER && (gameState === "start" || gameState === "gameover" || gameState === "win")) {
        gameState = "playing";
        initMaze(); //reiniciar o labirinto ao reiniciar o jogo
    } else if (keyCode === ESCAPE && gameState === "playing") {
        gameState = "paused";
    } else if (keyCode === ESCAPE && gameState === "paused") {
        gameState = "playing";
    }
}

//COLOCAÇAO DA PONTUACAO
function displayScore() {
    textSize(16);
    fill(255);
    textAlign(LEFT);
    text("Pontuação: " + score, 10, 20);
}

//COLOCACAO DAS VIDAS
function displayLives() {
    textSize(16);
    fill(255);
    textAlign(LEFT);
    text("Vidas: " + lives, 10, 40);
}

//COLOCACAO DAS PAREDES
function drawMaze() {
    for (let wall of walls) {
        wall.display();
    }
}

class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
//ESTILO DAS PAREDES
    display() {
        push(); //guarda o estilo de desenho atual
        stroke(0, 0, 255); //define a cor da linha como azul
        strokeWeight(3); //define a espessura da borda
        noFill(); //remove a cor de preenchimento dentro das paredes
        rect(this.x, this.y, this.width, this.height);
        pop(); //restaura o estilo de desenho anterior
    }

    collides(x, y, radius) {
        //verifica colisao com paredes
        return (
            x + radius > this.x &&
            x - radius < this.x + this.width &&
            y + radius > this.y &&
            y - radius < this.y + this.height
        );
    }
}
