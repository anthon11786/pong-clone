
class Vec { 
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    get len()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    set len(value) {
        const f = value / this.len;
        this.x *= f;
        this.y *= f;
    }
}

class Rect {
    constructor(w , h) {
        this.pos = new Vec(0, 0);
        this.size = new Vec(w, h);
    }
    get left() {
        return this.pos.x - this.size.x /2; 
    }
    get right() { 
        return this.pos.x + this.size.x / 2; 
    }
    get top() {
        return this.pos.y - this.size.y /2; 
    }
    get bottom() {
        return this.pos.y + this.size.y / 2; 
    }
}

class Ball extends Rect {
    constructor() {
        super(10, 10);
        this.vel = new Vec; 
    }
}

// Player class 
class Player extends Rect {
    constructor() {
        super(20, 100);
        this.score = 0; 

        this.vel = new Vec; 
    }
}

class Pong {
    constructor(canvas) {
        this._canvas = canvas;
        this._context = canvas.getContext("2d");

        // Initialize ball in class 
        this.ball = new Ball(); 

        // Array of all players 
        // Create 2 instances of players 
        this.players = [
            new Player(),
            new Player()
        ];

        // start positions 
        this.players[0].pos.x = 40; 
        this.players[1].pos.x = this._canvas.width - 40;
        this.players.forEach(player => {
            player.pos.y = this._canvas.height / 2;
        })

        
       
        // Animate the ball! 
        let lastTime; 
        const callback = (millis) => { 
            if (lastTime) {
                this.update((millis - lastTime) / 1000);
            }
            lastTime = millis;
            requestAnimationFrame(callback);
        };
        this.reset();

        // Pixel definitions for score numbers 
        this.CHAR_PIXEL = 10; 
        this.CHARS = [
            '111101101101111',
            '010010010010010',
            '111001111100111',
            '111001111001111',
            '101101111001001',
            '111100111001111',
            '111100111101111',
            '111001001001001',
            '111101111101111',
            '111101111001111',
        ].map(str => {
            // Creates an array of canvases we can paint later 
            // For each string we create a new canvas, for each '1' we create white square 
            const canvas = document.createElement('canvas'); // create a new canvas for score
            canvas.width = this.CHAR_PIXEL * 3;
            canvas.height = this.CHAR_PIXEL * 5;

            const context = canvas.getContext("2d"); // create a new canvas for score
            context.fillStyle = '#fff'; // fill it with white

            str.split('').forEach((fill, i) => {
                // if its a '1' we paint context 
                if (fill === '1') {
                    context.fillRect(
                        (i % 3 ) * this.CHAR_PIXEL, 
                        (i / 3 | 0 ) * this.CHAR_PIXEL, 
                        this.CHAR_PIXEL, 
                        this.CHAR_PIXEL);
                }
            });
            return canvas;
        })
        callback();

        

     
    }
    collide(player, ball) {
        if (player.left < ball.right && player.right > ball.left && 
            player.top < ball.bottom && player.bottom > ball.top) {
            // Player is coliding with the ball 
            const len = ball.vel.len; 
            ball.vel.y += 300 * (Math.random() - 0.5); 

            ball.vel.x = -ball.vel.x; // negate x velocity 
            ball.vel.len = len * 1.05 // increase speed after each paddle hit

        }
    }

    draw() {
        // And re-draw everything!
        // Black bacground 
        this._context.fillStyle = "black"; // make it black background
        this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);

        this.drawRect(this.ball);
        this.players.forEach(player => {
            this.drawRect(player);
        })
        this.drawScore();

    }
    drawScore() {
        const align = this._canvas.width / 3; 
        const CHAR_W = this.CHAR_PIXEL * 4; 
        this.players.forEach((player,  index) => {
            const chars = player.score.toString().split('');
            // Calculate offset from left 
            const offset = align * 
                            (index + 1) - 
                            (CHAR_W * chars.length / 2) + this.CHAR_PIXEL /2; 
            chars.forEach((char, pos) => {
                this._context.drawImage(this.CHARS[char|0], offset + pos * CHAR_W, 20)
            })
        })
    }
    drawRect(rect) {
        // white square 
        this._context.fillStyle = "white"; // make it black background
        this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);

    }
    // Reset the game once point is scored 
    reset() {
        this.ball.pos.x = this._canvas.width / 2; 
        this.ball.pos.y = this._canvas.height / 2; 

        this.ball.vel.x = 0; 
        this.ball.vel.y = 0;
    }

    // Start the game, if ball is not in motion, set in motion 
    start() {
        if (this.ball.vel.x == 0 && this.ball.vel.y == 0){
            this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1); 
            this.ball.vel.y = 300 * (Math.random() * 2 - 1 ); 

            this.ball.len = 200; 
        }

    }

    // Now we have to Animate the ball! 
    update(delta_time) {
        this.ball.pos.x += this.ball.vel.x * delta_time; // Movement of this.ball is relative to time diff
        this.ball.pos.y += this.ball.vel.y * delta_time;   

        // We need to detect if this.ball touches the corners of the screen 
        if (this.ball.left < 0 || this.ball.right > this._canvas.width) {
            this.ball.vel.x = -this.ball.vel.x;
            if (this.ball.vel.x > 0) {
                this.players[1].score += 1;
            }
            else {
                this.players[0].score += 1; 
            }   
            this.players.forEach(player => {
                console.log(player.score);
            });
            this.reset();
        }
        if (this.ball.bottom < 0 || this.ball.top > this._canvas.height) {
            this.ball.vel.y = -this.ball.vel.y;
        }

        this.players[1].pos.y = this.ball.pos.y;

        this.players.forEach(player => {
                    this.collide(player, this.ball);
        })

        this.draw(); 
        
    }
}

const canvas = document.getElementById("pong");

const pong = new Pong(canvas);

// Creater handler for mouse events for player one 
canvas.addEventListener("mousemove", (event) => {
    pong.players[0].pos.y = event.offsetY;
});

// Click on canvas and run pong.start() to start game! 
canvas.addEventListener("click", () => {
    pong.start();
});