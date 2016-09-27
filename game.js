/*
todo:
    tutorial/menus
    assets
        items are like cakes and things cus those are cute
    make it so items don't overlap

future maybes:
    make them type words instead of hit indiv letters

theme/skin:
    agl maintains walk cycle of a cat. if you stop doing it the cat stops
    other stuff is stuff the cat is passing. for now just letters, maybe words later
    pick up/comically eat the thing
*/

var game = new Phaser.Game(1000,400, Phaser.AUTO, 'content', 
    { preload: preload, create: create, update: update, render: render });

var mode = 'start'; //'start','end', or 'game'

var menu; //the menu background, to fade stuff out
var startMenu; //the actual text/image that goes on the menus
var endMenuWin;
var endMenuLose;

var cat;

var indicators; //group for the AGL indicators, for input feedback

var items; //group for incoming objects
var ifItemsMoving = []; //to keep track of which items are moving
var ifItemsEdible = []; //if the item is in eating distance ;)

var start; //start time
var score; //how much stuff u ate
var life; //time left
var timeDisplay; //timer display
var scoreDisplayE; //the score bar background
var scoreDisplayF; //the score bar filler

var cycle=0; //keep track of the cycling 3 letters
 
var cycleKeys=[]; //keyboard input for cycle keys
var keys=[]; //keyboard input for the rest of them

var jumpAudio; //the sound when the player jumps

function preload() {
    //parameters are name, location, width, height
    game.load.spritesheet('indicators', 'assets/indicators.png', 40, 42);
    game.load.spritesheet('items', 'assets/items.png', 63, 59);
    game.load.spritesheet('cat', 'assets/cat-sheet.png', 300, 220);

    //ui stuff
    game.load.image('menubackground','assets/menub.png');
    game.load.image('menuStart','assets/menus.png');
    game.load.image('menuEnd','assets/menue.png');
    game.load.spritesheet('scoreEmpty', 'assets/scoreEmpty.png', 200, 20);
    game.load.spritesheet('scoreFull', 'assets/scoreFull.png', 200, 20);

    //sound
    game.load.audio('jumpSound', 'assets/bloop.wav');

    game.stage.backgroundColor = '#eee'; 
}

function create() {

    //  cycle keys
    cycleKeys[0] = game.input.keyboard.addKey(Phaser.Keyboard.A);
    cycleKeys[1] = game.input.keyboard.addKey(Phaser.Keyboard.G);
    cycleKeys[2]= game.input.keyboard.addKey(Phaser.Keyboard.L);

    //doing this weird function thing so i can pass in other parameters
    cycleKeys[0].onDown.add(function(){keyDown(0);}, this); 
    cycleKeys[1].onDown.add(function(){keyDown(1);}, this);
    cycleKeys[2].onDown.add(function(){keyDown(2);}, this);
    cycleKeys[0].onUp.add(function(){keyUp(0);}, this);
    cycleKeys[1].onUp.add(function(){keyUp(1);}, this);
    cycleKeys[2].onUp.add(function(){keyUp(2);}, this);

    //item keys
    //note keycode for A is 65
    keys[0] = game.input.keyboard.addKey(Phaser.Keyboard.B);
    keys[1] = game.input.keyboard.addKey(Phaser.Keyboard.C);
    keys[2] = game.input.keyboard.addKey(Phaser.Keyboard.D);
    keys[3] = game.input.keyboard.addKey(Phaser.Keyboard.E);
    keys[4] = game.input.keyboard.addKey(Phaser.Keyboard.F);
    keys[5] = game.input.keyboard.addKey(Phaser.Keyboard.H);
    keys[6] = game.input.keyboard.addKey(Phaser.Keyboard.I);
    keys[7] = game.input.keyboard.addKey(Phaser.Keyboard.J);
    keys[8] = game.input.keyboard.addKey(Phaser.Keyboard.K);
    keys[9] = game.input.keyboard.addKey(Phaser.Keyboard.M);
    keys[10]= game.input.keyboard.addKey(Phaser.Keyboard.N);
    keys[11]= game.input.keyboard.addKey(Phaser.Keyboard.O);
    keys[12]= game.input.keyboard.addKey(Phaser.Keyboard.P);
    keys[13]= game.input.keyboard.addKey(Phaser.Keyboard.Q);
    keys[14]= game.input.keyboard.addKey(Phaser.Keyboard.R);
    keys[15]= game.input.keyboard.addKey(Phaser.Keyboard.S);
    keys[16]= game.input.keyboard.addKey(Phaser.Keyboard.T);
    keys[17]= game.input.keyboard.addKey(Phaser.Keyboard.U);
    keys[18]= game.input.keyboard.addKey(Phaser.Keyboard.V);
    keys[19]= game.input.keyboard.addKey(Phaser.Keyboard.W);
    keys[20]= game.input.keyboard.addKey(Phaser.Keyboard.X);
    keys[21]= game.input.keyboard.addKey(Phaser.Keyboard.Y);
    keys[22]= game.input.keyboard.addKey(Phaser.Keyboard.Z);

    for (var i=0; i<keys.length; i++){
        keys[i].onDown.add(keyUpItem,this);
    }

    //the cat
    cat = game.add.sprite(game.width*0.5, game.height*0.5, 'cat');
    cat.anchor = new Phaser.Point(0.5,0.5);
    cat.animations.add('walk',[0,1,2,3,4,5],8,true);
    cat.frame=0;
    // cat.animations.play('walk');

    //score ui
    scoreDisplayE = game.add.sprite(game.width - 250, 30, 'scoreEmpty');
    scoreDisplayF = game.add.sprite(game.width - 250, 30, 'scoreFull');
    scoreDisplayF.scale.x=0;

    //the cycle indicators (basically ui)
    indicators = game.add.group();
    for (var i=0;i<3; i++){
        var newPlatform = indicators.create(480+i*40,150,'indicators');
        newPlatform.anchor.setTo(0.5,0.5);
        newPlatform.frame = i;
    }

    //the items
    items = game.add.group();
    for (var i=0; i<keys.length; i++){
        ifItemsMoving[i]=false;
        ifItemsEdible[i]=false;

        var temp = items.create(game.width, game.height*0.6, 'items');
        temp.frame=i;
    }

    //the other UI
    menu = game.add.tileSprite(0, 0, 1024, 1024, 'menubackground');
    menu.alpha=0;//.9;
    startMenu = game.add.tileSprite(game.width*0.5-800/2, game.height*0.50-400/2, 800,400, 'menuStart');
    startMenu.alpha=1;
    endMenuLose = game.add.tileSprite(game.width*0.5-800/2, game.height*0.50-400/2, 800,400,'menuEnd');
    endMenuLose.alpha=0;
    //TEMP!!! TODO!!
    endMenuWin = game.add.tileSprite(game.width*0.5-800/2, game.height*0.50-400/2, 800,400,'menuEnd');
    endMenuWin.alpha=0;
    
    var style = {font: 'bold 20pt monospace',
                 fill: '#8D703D',
                 align: 'left'};
    timeDisplay = game.add.text(30,20, "1:00", style);
    timeDisplay.anchor.setTo(0,0);

    //sound
    jumpAudio = game.add.audio('jumpSound');

    game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

    initialize();

}

//to reinitialize everything
function initialize(){
    //  set the player's score to zero
    score = 0;
    life = 60;//100;
}

//for eating the items
function keyUpItem(key){
    //65 is keycode for A, -1 since A isn't there
    var itemN = key.keyCode-65-1;

    //adjusting for G and L missing. 71 is G, 76 is L
    if (key.keyCode > 71) itemN = itemN-1;
    if (key.keyCode > 76) itemN = itemN-1;

    console.log("ummm " +itemN);
    var item = items.children[itemN];
    if (ifItemsEdible[itemN]){
        //EAT IT!!!!!!
        console.log("im gonna eat it.");
        score = score+1;
        scoreDisplayF.scale.x = scoreDisplayF.scale.x + 0.1;
        ifItemsMoving[itemN] = false;
        ifItemsEdible[itemN] = false;
        item.position.x = game.width;
    }
}

//for when someone presses AGL down, so we can scale it to give input feedback
function keyDown(key){
    if (mode == 'game'){
        indicators.children[key].scale = new Phaser.Point(1.2,1.2);   
    }
}

//for when someone releases AGL
//checks if it's the next in sequence and moves the cycle ahead accordingly
function keyUp(key){
    if (mode == 'start'){
        if (key == 0) {
            mode = 'game';
            menu.alpha=0;
            startMenu.alpha=0;
        }
    } else if (mode == 'game'){
        indicators.children[key].scale = new Phaser.Point(1,1);   
        checkCycle(key);          
    }
}

//checks if players are doing the AGL cycle correctly
function checkCycle(key){
    if (key==cycle){
        indicators.children[cycle].alpha = 0.25;
        cycle=(cycle+1)%3;
        cat.frame = (cat.frame+1)%6;
        for (var i=0; i<ifItemsMoving.length; i++){
            if (ifItemsMoving[i]){
                var item =items.children[i];
                item.position.x=item.position.x-10; //hmm this keeps it moving only if the cat is moving. hmm.
            }
        }
    }
}

function updateCounter(){
    life--;
}

function update() {

    if (mode == 'game'){
        zero="";
        if (life<10)
            zero="0";
        timeDisplay.setText("0:"+zero+life);

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
                if (item.position.x > 552 && item.position.x < 647){
                    ifItemsEdible[i] = true;
                    item.scale=new Phaser.Point(1.1,1.1);
                }else {
                    ifItemsEdible[i] = false;
                    item.scale=new Phaser.Point(1,1);
                }
            }
        }

        //figure out if an itme is moving across screen
        if (Math.floor(Math.random()*100)==1){ // chance another is coming
            var which = Math.floor(Math.random()*keys.length); //determins which item
            if (!ifItemsMoving[which]){
                // console.log(which + " incoming");
                items.children[which].position.x=game.width-10; //move item to right edge of screen
                ifItemsMoving[which]=true;
            }
        }

        //UI for cycle keys
        indicators.children[cycle].alpha = 1;
        indicators.children[(cycle+1)%3].alpha = 0.25;
        indicators.children[(cycle+2)%3].alpha = 0.25;
        
        //lose & win conditions
        //win if score is high enough
        if (score > 99){
            console.log("win");
            mode = 'end';
            menu.alpha=0.9;
            endMenuWin.alpha=1;
        }

        // lose if no life
        if (life <= 0) {
            console.log("lose");
            mode = 'end';
            menu.alpha=0.9;
            endMenuLose.alpha=1;
        }
    }else if (mode == 'end'){
        // if (keys[1].isDown){
        //     mode = 'game';
        //     initialize();
        //     menu.alpha=0;
        //     endMenu.alpha=0;
        // }
    }
  
    

}

function render(){

}
