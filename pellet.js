class Pellet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
    }

    display() {
        fill(200);
        ellipse(this.x, this.y, this.radius * 2);
    }
}

class SpecialPellet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.isSpecial = true;
    }

    display() {
        fill(255, 255, 0);
        ellipse(this.x, this.y, this.radius * 2);
    }

    //metodo para verificar se o pacman está perto o suficiente para comer o SpecialPellet
    eats(pacman) {
        let d = dist(this.x, this.y, pacman.x, pacman.y);
        if (d < this.radius + pacman.radius) {
            
            return true; //retorna true para indicar que o SpecialPellet foi comido
        }
        return false; //retorna false se nao foi comido
    }
}

