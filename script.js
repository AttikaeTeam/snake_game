window.onload = function () {
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 200;
    var snakee;
    var applee;
    var imageApplee = new Image();
    var imageBackground = new Image(); // Ajout de l'image de fond
    var imageHead = new Image(); // Ajout de l'image de la tête de serpent
    var widthInBlocks = canvasWidth / blockSize;
    var heightInBlocks = canvasHeight / blockSize;
    var score;
    var highscore;
    var timeout;

    // Charger l'image de fond
    imageBackground.src = "jungle_background.png";
    imageApplee.src = "Apple_icon_1.png";
    imageHead.src = "snake_head-transformed.png"; // Image de la tête de serpent au format PNG avec transparence
    imageBackground.onload = function () {
        init();
    };

    function init() {
        var canvas = document.getElementById('myCanvas');
        canvas.style.border = "30px solid grey";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        ctx = canvas.getContext('2d');

        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        highscore = score;
        refreshCanvas();
    }

    function refreshCanvas() {
        snakee.advance();

        if (snakee.checkCollision()) {
            gameOver();
        } else {
            if (snakee.isEatingApple(applee)) {
                score++;
                highscore = Math.max(score, highscore);
                snakee.ateApple = true;
                do {
                    applee.setNewPosition();
                } while (applee.isOnSnake(snakee));
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Dessiner l'image de fond
            ctx.drawImage(imageBackground, 0, 0, canvasWidth, canvasHeight);

            // Dessiner un motif semi-transparent au-dessus de l'image de fond
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Noir avec une opacité de 50%
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            drawScore();
            snakee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function gameOver() {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("GAME OVER !", centreX, centreY - 180);
        ctx.fillText("GAME OVER !", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer.", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer.", centreX, centreY - 120);
        ctx.restore();
    }

    function restart() {
        snakee = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
        applee = new Apple([10, 10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.font = "bold 30px sans-serif";
        ctx.fillStyle = "#FFFFFF";//FFFFFF 606060
        ctx.textAlign = "center";
        ctx.fillText("High Score = " + highscore.toString(), 150, 30);
        ctx.restore();
    }

    function drawBlock(position, image = null, angle = 0, flip = false) {
        var radiusX = blockSize / 2;
        var radiusY = blockSize / 3;
        var x = position[0] * blockSize + radiusX;
        var y = position[1] * blockSize + radiusY;

        if (image) {
            ctx.save();
            ctx.translate(x, y);
            if (flip) {
                ctx.scale(-1, 1);
                x = -radiusX;
            } else {
                ctx.rotate(angle);
                x = -radiusX;
            }
            ctx.drawImage(image, x, -radiusX, blockSize, blockSize);
            ctx.restore();
        } 
        else {
        // Dessiner un segment elliptique pour chaque partie du corps du serpent
        ctx.beginPath();
        ctx.ellipse(position[0] * blockSize + radiusX, position[1] * blockSize + radiusX, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // Dessiner l'image de texture d'écailles à l'intérieur de l'ellipse
        ctx.save();
        ctx.clip();
        ctx.drawImage(snakee.imageBody, position[0] * blockSize, position[1] * blockSize, blockSize, blockSize);
        ctx.restore();
        }
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.imageBody = new Image();
        this.imageBody.src = 'snake_body.jpg'; // Image de texture d'écailles de serpent au format JPG

        this.draw = function () {
            ctx.save();
            ctx.fillStyle = "#FFFF00";

            var angle;
            var flip = false;
            switch (this.direction) {
                case "right":
                    angle = 0;
                    break;
                case "down":
                    angle = Math.PI / 2;
                    break;
                case "left":
                    angle = 0;
                    flip = true;
                    break;
                case "up":
                    angle = -Math.PI / 2;
                    break;
                default:
                    angle = 0;           
            }
            // Dessiner la tête du serpent avec rotation et taille ajustée
            drawBlock(this.body[0], imageHead, angle, flip);

            // Dessiner le corps du serpent
            for (var i = 1; i < this.body.length; i++) {
                drawBlock(this.body[i]);
            }
            
            ctx.restore();
        };

        this.advance = function () {
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw ("Invalid Direction");
            }
            this.body.unshift(nextPosition);
            if (!this.ateApple) {
                this.body.pop();
            } else {
                this.ateApple = false;
            }
        };

        this.setDirection = function (newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ("Invalid Direction");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkCollision = function () {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }

            for (var i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };

        this.isEatingApple = function (appleToEat) {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
                return true;
            } else {
                return false;
            }
        };
    }

    function Apple(position) {
        this.position = position;

        this.draw = function () {
            var x = this.position[0] * blockSize;
            var y = this.position[1] * blockSize;
            ctx.drawImage(imageApplee, x, y, blockSize, blockSize);
        };

        this.setNewPosition = function () {
            var newX = Math.round(Math.random() * (widthInBlocks - 1));
            var newY = Math.round(Math.random() * (heightInBlocks - 1));
            this.position = [newX, newY];
        };

        this.isOnSnake = function (snakeToCheck) {
            var isOnSnake = false;

            for (var i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.keyCode;
        var newDirection;
        switch (key) {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    };
};

