class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 19;
        this.speed = 3;
        this.direction = createVector(0, 0); //começar com velocidade zero (ficar parado)
        this.angle = 0; //angulo inicial para a boca do pacman
        this.moving = false; //sinal para verificar se o pacman está em movimento
        this.mouthAngle = 0; //angulo inicial da boca
        this.mouthSpeed = 0.1; //velocidade da animaçao da boca
        this.mouthOpening = true; //sinal para controlar a abertura ou fecho da boca
        
    }
//DESENHO DO PACMAN
    display() {
        fill(255, 255, 0);//amarelo
        push(); //guarda o estado de transformaçao atual
        translate(this.x, this.y); //move a origem para a posiçao do pacman
        rotate(this.angle); //roda o pacman com base na direçao
        arc(0, 0, this.radius * 2, this.radius * 2, this.mouthAngle + QUARTER_PI, TWO_PI - this.mouthAngle - QUARTER_PI, PIE);
        pop(); //restaura o estado de transformaçao guardado
        this.updateMouth(); //atualiza a animaçao da boca
    }
//MOVIMENTO DA "BOCA" DO PACMAN
    updateMouth() {
        if (this.moving) {
            //atualiza o angulo da boca com base na animaçao
            if (this.mouthOpening) {
                this.mouthAngle -= this.mouthSpeed; //diminui o angulo ao abrir
                if (this.mouthAngle < -QUARTER_PI) { 
                    this.mouthOpening = false;
                }
            } else {
                this.mouthAngle += this.mouthSpeed; //aumenta o angulo ao fechar
                if (this.mouthAngle > 0) {
                    this.mouthOpening = true;
                }
            }
        } else {
            //reseta a animaçao da boca quando o pacman nao está em movimento
            this.mouthAngle = 0;
            this.mouthOpening = true;
        }
    }
//MOVIMENTO DO PACMAN
    move() {
        if (!this.moving) {
            return; //pacman fica parado se nao estiver em movimento
        }

        //move o pacman com base na direçao
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        //detecao de colisao com paredes
        for (let wall of walls) {
            if (wall.collides(this.x, this.y, this.radius)) {
                //pacman colidiu com uma parede, ajustar a posiçao para evitar sobreposiçao
                this.x -= this.direction.x * this.speed;
                this.y -= this.direction.y * this.speed;
                //parar o movimento do pacman na direçao da colisao
                this.direction.set(0, 0);
                this.moving = false; //parar de mover após a colisao
                return; //sair da funçao apos detecao de colisao
            }
        }

        //teleporta de um lado para o outro
        if (this.x < 0) {
            this.x = width;
        } else if (this.x > width) {
            this.x = 0;
        }
    }

    handleKeyPress() {
        // Muda a direçao do pacman com base na tecla pressionada
        if (keyCode === LEFT_ARROW) {
            this.direction.set(-1, 0);
            this.angle = PI; //define o angulo para a direçao esquerda
            this.moving = true; //começa a mover
        } else if (keyCode === RIGHT_ARROW) {
            this.direction.set(1, 0);
            this.angle = 0; //define o angulo para a direçao direita
            this.moving = true; //começa a mover
        } else if (keyCode === UP_ARROW) {
            this.direction.set(0, -1);
            this.angle = HALF_PI * 3; //define o angulo para a direçao cima
            this.moving = true; //começa a mover
        } else if (keyCode === DOWN_ARROW) {
            this.direction.set(0, 1);
            this.angle = HALF_PI; //define o angulo para a direçao baixo
            this.moving = true; //começa a mover
        }
    }

    eats(pellet) {
        let d = dist(this.x, this.y, pellet.x, pellet.y);
        return d < this.radius + pellet.radius;
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
        this.direction.set(0, 0); //Reseta a direçao para ficar parado
        this.angle = 0; //reseta o angulo para a direçao padrao
        this.moving = false; //reseta o sinal de movimento
    }

    hits(object) {
        let d = dist(this.x, this.y, object.x, object.y);
        return d < this.radius + object.radius;
    }
}
