//取得canvas畫布元素，並取得2D渲染環境，進行2D繪圖
//querySelector(CSS的ID選擇語法)，選擇html的element
const stage = document.createElement('canvas'),
    ctx = stage.getContext('2d'),
    //屏幕
    dialogue = document.querySelector('.dialogue'),
    //開始按鈕
    startBtn = dialogue.querySelector('button'),
    //計分條
    hud = document.querySelector('.hud'),
    scoreNode = hud.querySelector('.hud__score span');

//初始化宣告(ship船艦、lasers雷射、enemies敵人、items道具、是否開始遊戲gameStarted、
//speedMultiplier速度乘數、enemySeedFrameInterval隕石出現時間間隔、itemsSeedFrameInterval道具出現時間間隔、score分數)
let ship, lasers = [],
    enemies = [],
    item1 = [],
    double1 = [],
    playing = false,
    gameStarted = false,
    speedMultiplier,
    enemySeedFrameInterval,
    itemsSeedFrameInterval,
    doubleSeedFrameInterval,
    score = 0,
    powermode = false;

//隨機變數函式(在兩個值之間)
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//加分機制(敵人半徑越小，比較難打中，加越多分，成反比)
function addScore(x) {
    return Math.floor((1 / x) * 500);
}

//設定戰艦，ship class
function Ship(options) {
    //大小
    this.radius = 15;
    //戰艦的初始位置
    this.x = options.x || stage.width * .5 - this.radius - .5;
    this.y = options.y || stage.height - this.radius - 30;
    //外觀
    this.width = this.radius * 2;
    this.height = this.width;
    this.color = options.color || 'blue';
    //往左動、往右動、速度、存在與否
    this.left = false;
    this.right = false;
    this.speed = 10;
    this.active = true;
    //加入EventListener
    //keydown = 按下鍵盤、keyup = 放開鍵盤
    //綁定this，讓peoperty和this保持關聯
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
}
//戰艦復活位置
Ship.prototype.update = function(x) {
    this.x = x;
    this.y = stage.height - this.radius - 30;
}

//畫戰艦
Ship.prototype.draw = function() {
    //暫存
    ctx.save();

    //用四個矩形畫出戰艦
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x + this.radius - 5, this.y, 10, this.radius);
    ctx.fillRect(this.x, this.y + this.radius, this.width, 10);
    ctx.fillRect(this.x, this.y + this.radius + 10, 10, 5);
    ctx.fillRect(this.x + this.width - 10, this.y + this.radius + 10, 10, 5);
    //復原暫存
    ctx.restore();
}

Ship.prototype.onKeyDown = function(e) {
    //如果戰艦活著
    if (ship.active) {
        //控制左右移動
        if (e.keyCode === 39) this.right = true;
        else if (e.keyCode === 37) this.left = true;
        //空白鍵發射雷射
        if (e.keyCode == 32) {
            //雷射外觀
            const settings = {
                x: this.x + this.radius - 3,
                color: 'skyblue'
            };
            //新增、發射
            const laser = new Laser(settings);
            lasers.push(laser);
        }
    }
}

//放開左右鍵，停止移動
Ship.prototype.onKeyUp = function(e) {
    if (e.key === 'ArrowRight') this.right = false;
    else if (e.key === 'ArrowLeft') this.left = false;
}

//設定雷射(位置、速度、存在與否)
function Laser(options) {
    this.x = options.x;
    this.y = options.y || stage.height - 50;
    if (powermode === false) {
        this.x = options.x;
        this.width = 6;
    }
    if (powermode === true) {
        this.x = options.x - 22;
        this.width = 50;
    }

    this.height = 20;
    this.speed = 15;
    this.color = options.color || 'white';
    this.active = true;
}

//更新雷射位置
Laser.prototype.update = function(y) {
    this.y = y;
}

//畫雷射
Laser.prototype.draw = function() {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //矩形
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

//設定隕石
function Enemy(options) {
    //大小隨機
    this.radius = randomBetween(10, 40);
    this.width = this.radius * 2;
    this.height = this.width;
    //出現位置隨機
    this.x = randomBetween(0, stage.width - this.width);
    this.y = -this.radius * 2;
    this.color = options != undefined && options.color ? options.color : 'white';
    //速度、存在與否
    this.speed = 2;
    this.active = true;
}

//更新隕石位置
Enemy.prototype.update = function(x, y) {
    this.x = x;
    this.y = y;
}

//畫隕石
Enemy.prototype.draw = function() {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //圓形
    ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

//設定道具
function items(options) {
    this.radius = 10;
    this.width = this.radius * 2;
    this.height = this.width;
    //出現位置隨機
    this.x = randomBetween(0, stage.width - this.width);
    this.y = -this.radius * 2;
    this.color = options != undefined && options.color ? options.color : 'red';
    //速度、存在與否
    this.speed = 2;
    this.active = true;
}

//更新道具位置
items.prototype.update = function(x, y) {
    this.x = x;
    this.y = y;
}

//畫道具
items.prototype.draw = function() {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //圓形
    ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

//設定double分數道具
function double(options) {
    this.radius = 10;
    this.width = this.radius * 2;
    this.height = this.width;
    //出現位置隨機
    this.x = randomBetween(0, stage.width - this.width);
    this.y = -this.radius * 2;
    this.color = options != undefined && options.color ? options.color : 'green';
    //速度、存在與否
    this.speed = 2;
    this.active = true;
}

//更新double分數道具位置
double.prototype.update = function(x, y) {
    this.x = x;
    this.y = y;
}

//畫double分數道具
double.prototype.draw = function() {

    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //圓形
    ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

//判斷相撞
function hitTest(item1, item2) {
    let collision = true;
    if (
        item1.x > item2.x + item2.width ||
        item1.y > item2.y + item2.height ||
        item2.x > item1.x + item1.width ||
        item2.y > item1.y + item1.height
    ) {
        collision = false;
    }
    return collision;
}

//雷射擊中隕石
function handleLaserCollision() {
    for (let enemy of enemies) {
        for (let laser of lasers) {
            let collision = hitTest(laser, enemy);
            if (collision && laser.active) {
                //兩者皆消滅
                enemy.active = false;
                laser.active = false;

                // 提升隕石速度，縮短出現時間間隔
                speedMultiplier += .025;
                if (enemySeedFrameInterval > 20) {
                    enemySeedFrameInterval -= 2;
                }

                // 加分
                score += addScore(enemy.radius);
                scoreNode.textContent = score;
            }
        }
    }
}

//戰艦被隕石擊中
function handleShipCollision() {
    if (enemies.length) {
        for (let enemy of enemies) {
            let collision = hitTest(ship, enemy);
            if (collision) {
                //戰艦被消滅
                ship.active = false;
                //重新開始(初始化)
                //2秒後restart
                setTimeout(() => {
                    ship.active = true;
                    speedMultiplier = 1;
                    enemySeedFrameInterval = 100;
                    score = 0;
                    scoreNode.textContent = score;

                }, 2000);
            }
        }
    }
}

//戰艦吃到道具
function handleitemsCollision() {
    if (item1.length) {
        for (let item of item1) {
            let collision = hitTest(ship, item);
            if (collision) {
                item.active = false;
                powermode = true;
                setTimeout(() => {
                    powermode = false;
                }, 6000);
            }
        }
    }
}

//戰艦吃到double加分道具
function handledoublesCollision() {
    if (double1.length) {
        for (let double of double1) {
            let collision = hitTest(ship, double);
            if (collision) {
                double.active = false;
                // 加分
                score *= 2;
                scoreNode.textContent = score;
            }
        }
    }
}

//隨時產生戰艦
function drawShip(xPosition) {
    if (ship.active) {
        ship.update(xPosition);
        ship.draw();
    }
}

//隨時產生隕石
function drawEnemies() {
    if (enemies.length) {
        for (let enemy of enemies) {
            if (enemy.active) {
                enemy.update(enemy.x, enemy.y += enemy.speed * speedMultiplier);
                enemy.draw();
            }
        }
    }
}


//清除陣列中已經被消滅或超出視窗範圍的隕石
function enemyCleanup() {
    if (enemies.length) {
        enemies = enemies.filter(enemy => {
            let visible = enemy.y < stage.height + enemy.width;
            let active = enemy.active === true;
            return visible && active;
        });
    }
}

//隨時產生道具
function drawItems() {
    if (item1.length) {
        for (let item of item1) {
            if (item.active) {
                item.update(item.x, item.y += item.speed * speedMultiplier);
                item.draw();
            }
        }
    }
}

//清除陣列中已經被消滅或超出視窗範圍的道具
function itemCleanup() {
    if (item1.length) {
        item1 = item1.filter(item => {
            let visible = item.y < stage.height + item.width;
            let active = item.active === true;
            return visible && active;
        });
    }
}

//隨時產生double分數道具
function drawDouble() {
    if (double1.length) {
        for (let double of double1) {
            if (double.active) {
                double.update(double.x, double.y += double.speed * speedMultiplier);
                double.draw();
            }
        }
    }
}

//清除陣列中已經被消滅或超出視窗範圍的double分數道具
function doubleCleanup() {
    if (double1.length) {
        double1 = double1.filter(double => {
            let visible = double.y < stage.height + double.width;
            let active = double.active === true;
            return visible && active;
        });
    }
}
//隨時產生雷射
function drawLasers() {
    if (lasers.length) {
        for (let laser of lasers) {
            if (laser.active) {
                laser.update(laser.y -= laser.speed);
                laser.draw();
            }
        }
    }
}

//清除陣列中已經被消滅或超出視窗範圍的雷射
function laserCleanup() {
    lasers = lasers.filter(laser => {
        let visible = laser.y > -laser.height;
        let active = laser.active === true;
        return visible && active;
    });
}

//初始化計時器
let tick = 0;

function render(delta) {
    if (playing) {
        //取得戰艦位置
        let xPos = ship.x;

        // 產生隕石
        if (tick % enemySeedFrameInterval === 0 && ship.active) {
            const enemy = new Enemy();
            enemies.push(enemy);
        }

        // 產生道具
        if (tick % itemsSeedFrameInterval === 0 && ship.active) {
            const item = new items();
            item1.push(item);
        }

        // 產生double加分道具
        if (tick % doubleSeedFrameInterval === 0 && ship.active) {
            const doubles = new double();
            double1.push(doubles);
        }

        // 宇宙背景設定
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, stage.width, stage.height);
        ctx.restore();

        // 戰艦移動位置
        if (ship.left)
            xPos = ship.x -= ship.speed;
        else if (ship.right)
            xPos = ship.x += ship.speed;

        // 設定左右邊界
        if (gameStarted) {
            if (xPos < 0)
                xPos = 0;
            else if (xPos > stage.width - ship.width)
                xPos = stage.width - ship.width;
        }

        drawShip(xPos);

        handleShipCollision();
        handleLaserCollision();
        handleitemsCollision();
        handledoublesCollision();

        drawLasers();
        drawEnemies();
        drawItems();
        drawDouble();

        enemyCleanup();
        itemCleanup();
        laserCleanup();
        doubleCleanup();

        tick++;
    }
    //按時間(幀)對網頁更新
    requestAnimationFrame(render);
}

//開始遊戲
function startGame(e) {
    //隱藏屏幕、顯示計分條
    //$("dialogue").addclass("dialogue--hidden");
    dialogue.classList.add('dialogue--hidden');
    hud.classList.remove('hud--hidden');
    e.currentTarget.blur();

    // 初始化遊戲參數(原先為開始背景畫面)
    speedMultiplier = 1;
    enemySeedFrameInterval = 100;
    itemsSeedFrameInterval = 1000;
    doubleSeedFrameInterval = 800;
    ship.x = stage.width * .5 - ship.radius - .5;
    ship.y = stage.height - ship.radius - 30;
    enemies = [];
    item1 = [];
    double1 = [];
    gameStarted = true;
}

//調整視窗大小
function onResize() {
    stage.width = window.innerWidth;
    stage.height = window.innerHeight;
}

//加入EventListener
//偵測按下開始、調視窗大小
startBtn.addEventListener('click', startGame);
window.addEventListener('resize', onResize);

document.body.appendChild(stage);
onResize();

// 產生戰艦
ship = new Ship({ color: '#ff9d00', x: -100, y: -100 });

// 在開始畫面的背景，設定較快和較多的隕石出現
speedMultiplier = 6;
enemySeedFrameInterval = 20;

playing = true;
render();
