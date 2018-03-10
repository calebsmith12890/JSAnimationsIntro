function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function Background(game) {
    this.radius = 100;
    this.image = ASSET_MANAGER.getAsset("./img/background2.png");
    Entity.call(this, game, 0, 0);
}

Background.prototype = new Entity();
Background.prototype.constructor = Background;

Background.prototype.update = function () {
}

Background.prototype.draw = function (ctx) {
    ctx.drawImage(this.image, 0, 0, 1000, 600);
    Entity.prototype.draw.call(this);
}

function Knight(game) {
    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/KnightNew.png"), 0, 0, 256, 256, 0.07, 10, true, false);
    this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/KnightNew.png"), 0, 256*2, 256, 256, 0.05, 10, false, false);
    this.attackAnimation = new Animation(ASSET_MANAGER.getAsset("./img/KnightNew.png"), 0, 256*1, 256, 256, 0.05, 10, false, false);
    this.runningAnimation = new Animation(ASSET_MANAGER.getAsset("./img/KnightNew.png"), 0, 256*4, 256, 256, 0.05, 10, false, false);
    this.stabAnimation = new Animation(ASSET_MANAGER.getAsset("./img/KnightNew.png"), 0, 256*3, 256, 256, 0.05, 10, false, false);
    // this.runLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/Knight.png"), 0, 256*3, 256, 256, 0.05, 10, false, false);
    this.jumping = false;
    this.attacking = false;
    this.stabbing = false;
    this.running = false;
    this.radius = 100;
    this.ground = 300;
    Entity.call(this, game, 100, 325);
}

Knight.prototype = new Entity();
Knight.prototype.constructor = Knight;

Knight.prototype.update = function () {
    if (this.game.up) this.jumping = true;
    if (this.jumping) {
        if (this.jumpAnimation.isDone()) {
            this.jumpAnimation.elapsedTime = 0;
            this.jumping = false;
        }
    }
    if (this.game.space) this.attacking = true;
    if (this.attacking) {
        if (this.attackAnimation.isDone()) {
            this.attackAnimation.elapsedTime = 0;
            this.attacking = false;
        }
    }
    if (this.game.enter) this.stabbing = true;
    if (this.stabbing) {
        if (this.stabAnimation.isDone()) {
            this.stabAnimation.elapsedTime = 0;
            this.stabbing = false;
        }
    }
    if (this.game.right) this.running = true;
    if(this.running) {
        if (this.runningAnimation.isDone()) {
            this.runningAnimation.elapsedTime = 0;
            this.running = false;
        }
    }
    Entity.prototype.update.call(this);
}

Knight.prototype.draw = function (ctx) {
    if (this.x >= 850) this.x = -200;
    if (this.jumping) {
        this.x += 1;
        this.jumpAnimation.drawFrame(this.game.clockTick, ctx, this.x + 2, this.y - 4);
    }
    else if (this.attacking) {
        this.x += .25;
        this.attackAnimation.drawFrame(this.game.clockTick, ctx, this.x + 2, this.y - 4);
    }
    else if (this.stabbing) {
        this.x += .25;
        this.stabAnimation.drawFrame(this.game.clockTick, ctx, this.x + 2, this.y - 4);
    }
    else if (this.running) {
        this.x += 2.5;
        this.runningAnimation.drawFrame(this.game.clockTick, ctx, this.x + 2, this.y - 4)
    }
    else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    }
    Entity.prototype.draw.call(this);
}


// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

// ASSET_MANAGER.queueDownload("./img/RobotUnicorn.png");
ASSET_MANAGER.queueDownload("./img/Knight.png");
ASSET_MANAGER.queueDownload("./img/KnightNew.png");
ASSET_MANAGER.queueDownload("./img/background2.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var bg = new Background(gameEngine);
    // var unicorn = new Unicorn(gameEngine);
    var knight = new Knight(gameEngine);

    gameEngine.addEntity(bg);
    // gameEngine.addEntity(unicorn);
    gameEngine.addEntity(knight);

    gameEngine.init(ctx);
    gameEngine.start();
});
