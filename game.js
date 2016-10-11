/*
notes from class 10/4
    tweak rules so it's more playful, and less routine
        routine = not skillful play and you can like, zone out
        give player more option (like there's some pie?)
        or some process to eating food
    do more to convey state
    too easy to eat pie, since you can just stop walking
        it's tuned way too easy rn, wow
    make the pies more worried, more scared, more transition into that fear as they enter the Eating Zone

todo
    animate end screens?
    health bar flash?

*/
var shake = true; //these two are toggled by stuff in the html cus i'm a fancy piece of pie
var music = true;

var FOODSCORE = 6.25;
var POOPSCORE = 6.25;

var game = new Phaser.Game(800,400, Phaser.AUTO, 'content', 
    { preload: preload, create: create, update: update, render: render });

var mode = 'start'; //'start','end', or 'game'

var startMenu; //the actual text/image that goes on the menus
var endMenu;
var tutorial;

var cat;
var poop;

var indicators; //group for the AGL indicators, for input feedback

var items; //group for incoming objects
var ifItemsMoving = []; //to keep track of which items are moving
var ifItemsEdible = []; //if the item is in eating distance ;)
var isSomethingAtTheFront;
var latestPosition; //x position of the latest item going across the screen

var scoreFull = 100;
var totalTime = 60;
var score; //how much stuff u ate
var life; //time left
var timeDisplay; //timer display
var scoreDisplayE; //the score bar background
var scoreDisplayF; //the score bar filler

var cycle; //keep track of the cycling 3 letters
 
var spacebar;
var cycleKeys=[]; //keyboard input for cycle keys
var keys=[]; //keyboard input for the rest of them

var fartAudio; //the sound when the player jumps
var eatAudio;

function preload() {
    //parameters are name, location, width, height
    game.load.spritesheet('indicators', 'assets/indicators.png', 50, 50);
    game.load.spritesheet('items', 'assets/items.png', 80, 120);
    game.load.spritesheet('cat', 'assets/cat-sheet.png', 300, 220);
    game.load.spritesheet('poop', 'assets/poop-sheet.png', 100, 107);

    //ui stuff
    game.load.image('background','assets/background.png');
    game.load.image('tutorial','assets/tutorial.png');
    game.load.image('menuStart','assets/menus.png');
    game.load.spritesheet('menuEnd','assets/menue.png',800,400);
    game.load.spritesheet('scoreEmpty', 'assets/scoreEmpty.png', 200, 20);
    game.load.spritesheet('scoreFull', 'assets/scoreFull.png', 200, 20);

    //sound
    // game.load.audio('backgroundMusic', 'assets/bloop.wav');
    game.load.audio('fart', 'assets/fart.ogg');
    game.load.audio('eat', 'assets/eat.ogg');
    // game.load.audio('jumpSound', 'assets/bloop.wav');

    game.stage.backgroundColor = '#eee'; 
}

function create() {
    //sound
    fartAudio = game.add.audio('fart');
    eatAudio = game.add.audio('eat');

    game.add.tileSprite(0,0,800,400,'background');

    //spacebar
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spacebar.onUp.add(space, this);

    //  cycle keys
    cycleKeys[0] = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cycleKeys[1] = game.input.keyboard.addKey(Phaser.Keyboard.D);
    cycleKeys[2] = game.input.keyboard.addKey(Phaser.Keyboard.J);
    cycleKeys[3] = game.input.keyboard.addKey(Phaser.Keyboard.L);

    //doing this weird function thing so i can pass in other parameters
    cycleKeys[0].onDown.add(function(){keyDown(0);}, this); 
    cycleKeys[1].onDown.add(function(){keyDown(1);}, this);
    cycleKeys[2].onDown.add(function(){keyDown(2);}, this);
    cycleKeys[3].onDown.add(function(){keyDown(3);}, this);
    cycleKeys[0].onUp.add(function(){keyUp(0);}, this);
    cycleKeys[1].onUp.add(function(){keyUp(1);}, this);
    cycleKeys[2].onUp.add(function(){keyUp(2);}, this);
    cycleKeys[3].onUp.add(function(){keyUp(3);}, this);

    //item keys
    //note keycode for A is 65
    keys[0] = game.input.keyboard.addKey(Phaser.Keyboard.B);
    keys[1] = game.input.keyboard.addKey(Phaser.Keyboard.C);
    keys[2] = game.input.keyboard.addKey(Phaser.Keyboard.E);
    keys[3] = game.input.keyboard.addKey(Phaser.Keyboard.F);
    keys[4] = game.input.keyboard.addKey(Phaser.Keyboard.G);
    keys[5] = game.input.keyboard.addKey(Phaser.Keyboard.H);
    keys[6] = game.input.keyboard.addKey(Phaser.Keyboard.I);
    keys[7] = game.input.keyboard.addKey(Phaser.Keyboard.K);
    keys[8] = game.input.keyboard.addKey(Phaser.Keyboard.M);
    keys[9] = game.input.keyboard.addKey(Phaser.Keyboard.N);
    keys[10]= game.input.keyboard.addKey(Phaser.Keyboard.O);
    keys[11]= game.input.keyboard.addKey(Phaser.Keyboard.P);
    keys[12]= game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keys[13]= game.input.keyboard.addKey(Phaser.Keyboard.R);
    keys[14]= game.input.keyboard.addKey(Phaser.Keyboard.S);
    keys[15]= game.input.keyboard.addKey(Phaser.Keyboard.T);
    keys[16]= game.input.keyboard.addKey(Phaser.Keyboard.U);
    keys[17]= game.input.keyboard.addKey(Phaser.Keyboard.V);
    keys[18]= game.input.keyboard.addKey(Phaser.Keyboard.W);
    keys[19]= game.input.keyboard.addKey(Phaser.Keyboard.X);
    keys[20]= game.input.keyboard.addKey(Phaser.Keyboard.Y);
    keys[21]= game.input.keyboard.addKey(Phaser.Keyboard.Z);

    for (var i=0; i<keys.length; i++){
        keys[i].onDown.add(keyUpItem,this);
    }

    //the cat
    cat = game.add.sprite(game.width*0.30, game.height*0.5, 'cat');
    cat.anchor = new Phaser.Point(0.5,0.5);
    cat.animations.add('walk',[0,1,2,3,4,5],8,true);
    cat.frame=0;

    //the poop
    poop = game.add.sprite(game.width*0.1, game.height*0.65, 'poop');
    poop.anchor = new Phaser.Point(0.5,0.5);
    poop.animations.add('poop',[0,1,2,3,4,5,6,7],8,false);
    poop.frame=7;

    //score ui
    scoreDisplayE = game.add.sprite(game.width - 250, 30, 'scoreEmpty');
    scoreDisplayF = game.add.sprite(game.width - 250, 30, 'scoreFull');
    scoreDisplayF.scale.x=0;

    //the cycle indicators (basically ui)
    indicators = game.add.group();
    for (var i=0;i<cycleKeys.length; i++){
        var newPlatform = indicators.create(200+i*40,150,'indicators');
        newPlatform.anchor.setTo(0.5,0.5);
        newPlatform.frame = i;
    }

    //the items
    items = game.add.group();
    for (var i=0; i<keys.length; i++){
        ifItemsMoving[i]=false;
        ifItemsEdible[i]=false;

        var temp = items.create(game.width, game.height*0.65, 'items');
        temp.frame=i+22;
    }
    
    var style = {font: '20pt Verdana',
                 fill: '#ff4f4f',
                 align: 'left'};
    timeDisplay = game.add.text(30,20, "1:00", style);
    timeDisplay.anchor.setTo(0,0);
    timeDisplay.alpha=0;

    //the other UI
    startMenu = game.add.tileSprite(game.width*0.54, 0, 325,275, 'menuStart');
    startMenu.alpha=1;
    tutorial = game.add.tileSprite(0, 0, 800, 400, 'tutorial');
    tutorial.alpha=0;
    endMenu = game.add.sprite(0, 0, 'menuEnd');
    endMenu.alpha=0;

    game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

    initialize();

}

//to reinitialize everything
function initialize(){
    //  set the player's score to zero
    score = 50;
    life = totalTime;
    scoreDisplayF.scale.x=0;
    cycle = 0;
    isSomethingAtTheFront=false;
    latestPosition=0;

    indicators.children[0].frame = 0;
    indicators.children[1].frame = 1;
    indicators.children[2].frame = 2;
    indicators.children[3].frame = 3;

    for (var i=0; i<keys.length; i++){
        ifItemsMoving[i]=false;
        ifItemsEdible[i]=false;
        items.children[i].x=game.width;
    }
}

//for eating the items
function keyUpItem(key){
    //65 is keycode for A, -1 since A isn't there
    var itemN = key.keyCode-65-1;

    //adjusting for D, J and L missing. d 68, j 74 l 76
    if (key.keyCode > 68) itemN = itemN-1;
    if (key.keyCode > 74) itemN = itemN-1;
    if (key.keyCode > 76) itemN = itemN-1;

    // console.log("ummm " +itemN);
    var item = items.children[itemN];

    if (ifItemsEdible[itemN]){
        //EAT IT!!!!!!
        console.log("im gonna eat it.");
        if (music) eatAudio.play();
        score = score+FOODSCORE;
        if (score > scoreFull){
            score = scoreFull;
        }
        ifItemsMoving[itemN] = false;
        ifItemsEdible[itemN] = false;
        item.position.x = game.width;
        cat.frame = cat.frame + 6;
    }
}

//for when someone presses AGL down, so we can scale it to give input feedback
function keyDown(key){
    if (mode == 'game'){
        indicators.children[key].scale = new Phaser.Point(1.2,1.2);
        checkCycle(key);
    }
}

function space(key){
    if (mode == 'start'){
        mode = 'tutorial';
        tutorial.alpha=1;
        startMenu.alpha=0;
    }else if (mode == 'tutorial'){
        mode = 'game';
        if (music) playMusic();
        tutorial.alpha=0;
        life = totalTime;    
        score = scoreFull/2;    
    }else if (mode == 'end'){
        console.log("start over");
        mode = 'game';
        endMenu.alpha=0;
        initialize();
        if (music) playMusic();
    }
}

//for when someone releases AGL
//checks if it's the next in sequence and moves the cycle ahead accordingly
function keyUp(key){
    if (mode == 'game'){
        indicators.children[key].scale = new Phaser.Point(1,1);
        indicators.children[0].frame = 0;
        indicators.children[1].frame = 1;
        indicators.children[2].frame = 2;
        indicators.children[3].frame = 3;
    }
}

//checks if players are doing the AGL cycle correctly
function checkCycle(key){
    if (key==cycle){
        indicators.children[cycle].alpha = 1;//0.25;
        cycle=(cycle+1)%4;
        cat.frame = (cat.frame+1)%6;

        isSomethingAtTheFront=false;

        for (var i=0; i<ifItemsMoving.length; i++){
            if (ifItemsMoving[i]){
                var item =items.children[i];
                item.position.x=item.position.x-20; //hmm this keeps it moving only if the cat is moving. hmm.
                if (latestPosition < item.position.x+item.width){
                    latestPosition=item.position.x+item.width;
                }
            }
        }
    }else {
        //poop out!
        if (shake) game.camera.shake(0.0025,250);
        if (music) fartAudio.play();
        poop.alpha=1;
        poop.animations.stop('poop',true);
        poop.animations.play('poop');
        score = score-POOPSCORE;
        indicators.children[0].frame = 8;
        indicators.children[1].frame = 9;
        indicators.children[2].frame = 10;
        indicators.children[3].frame = 11;
    }
}

function updateCounter(){
    // life--;
    score = score - 2;
}

function update() {

    if (mode == 'game'){
        zero="";
        if (life<10)
            zero="0";
        timeDisplay.setText("0:"+zero+life);
        scoreDisplayF.scale.x = score / 100;

        //deal with the items
        for (var i=0; i<ifItemsMoving.length; i++){
            if (ifItemsMoving[i]){ //if the item is moving, keep it moving
                var item = items.children[i];
                // console.log(i);
                // item.position.x = item.position.x - 2;

                //check if item is past left edge of screen
                if (item.position.x < -item.width){ 
                    ifItemsMoving[i] = false; //put it back in play
                    // console.log("past screen");
                }

                //check if it's within target area
                if (item.position.x > (cat.position.x+cat.width/2-125) && 
                    item.position.x < (cat.position.x+cat.width/2-25)){
                    ifItemsEdible[i] = true;
                    // item.scale=new Phaser.Point(1.1,1.1);
                    item.frame=i+3*items.children.length;
                }else if (item.position.x > (cat.position.x+cat.width/2-25) &&
                    item.position.x < (cat.position.x+cat.width/2+200)){
                    item.frame = i + 2*items.children.length;
                }else {
                    ifItemsEdible[i] = false;
                    // item.scale=new Phaser.Point(1,1);
                    item.frame=i+22;
                }
            }
        }

        //figure out if an itme is moving across screen
        if (Math.floor(Math.random()*50)==1 && !isSomethingAtTheFront){ // chance another is coming
            var which = Math.floor(Math.random()*keys.length); //determins which item
            if (!ifItemsMoving[which]){
                // console.log(which + " incoming");
                items.children[which].position.x=game.width; //move item to right edge of screen
                ifItemsMoving[which]=true;
                isSomethingAtTheFront=true;
                if (latestPosition > game.width){
                    items.children[which].position.x=latestPosition;
                }
                latestPosition=game.width+items.children[which].width;
                console.log("spawned a "+which+" at position "+items.children[which].position.x);
            }
        }

        //UI for cycle keys
        indicators.children[cycle].alpha = 1;
        indicators.children[(cycle+1)%4].alpha = 0.5;
        indicators.children[(cycle+2)%4].alpha = 0.5;
        indicators.children[(cycle+3)%4].alpha = 0.5;
        
        //lose & win conditions
        //win if score is high enough
        if (score >= scoreFull){
            console.log("win");
            mode = 'end';
            if (music) pauseMusic();
            endMenu.frame=0;
            endMenu.alpha=1;
        }

        // lose if no life
        if (life <= 0 || score <= 0) {
            console.log("lose");
            score = 0;
            scoreDisplayF.scale.x=0;
            if (music) pauseMusic();
            mode = 'end';
            endMenu.frame=1;
            endMenu.alpha=1;
        }
    }else if (mode == 'end'){
    }
}

function render(){
}
