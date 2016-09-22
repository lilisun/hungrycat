/*
todo:
    use onkeyup or whatever
    add other keys as obstacles
        possibility: make them type words

possible themes/skins:
    agl maintains outline and others are objects you have to interact with
        this involves a lot of drawing lmfao
    agl = petting a cat, others are things u have to avoid. responsibilities. something

    COMBINE!!!!! GET RID OF SHITTY SYMBOLISM
        agl maintains walk cycle of a cat. if you stop doing it the cat stops and then also starts degenerating
            (like the outline gets shakier)
            (cuz it's DYING FROM HUNGER)
        other stuff is stuff the cat is passing. for now just letters, maybe words/objects later
        pick up/kick/comically eat the thing
        at the end, when the cat is full, meets a human who squats down to pet it :D

        the game name is "my cat is hungry"

        food ideas:
        pork bun, cheese, bokchoy, eggs, fish, beef, cookie, duck, donut, zucchini, rice
*/

var game = new Phaser.Game(1000,400, Phaser.AUTO, 'content', 
    { preload: preload, create: create, update: update, render: render });

var DEBUG = false; //if you change this to true, it will show the collision boxes in the scene

var mode = 'start'; //'start','end', or 'game'

var menu; //the menu background, to fade stuff out
var startMenu; //the actual text/image that goes on the menus
var endMenu;

var platforms; //the group we'll hold all the platforms in
var score; //this will just be an integer (whole number)
var scoreText;
var scoreDisplay; //the text object thingie
var life;
var jumpAudio; //the sound when the player jumps
var numPlatforms=5;

var cycle=0; //keep track of the cycling 3 letters
var clear=true;
var target=0;

//use this to randomize the order the letters are placed
var toastFrames = [0,6,11,8,22];
//after toasts are placed, use it to keep track of score.
 
var keys=[];

function preload() {
    //name, location, width, height
    // game.load.spritesheet('playerSprite', 'assets/butter.png', 1024, 1024);
    // game.load.spritesheet('hatSprite', 'assets/hat.png', 50, 50);
    game.load.spritesheet('platformSprite', 'assets/breads.png', 40, 42);

    game.load.audio('jumpSound', 'assets/bloop.wav');

    game.load.image('menubackground','assets/menub.png');
    game.load.image('menuStart','assets/menus.png');
    game.load.image('menuEnd','assets/menue.png');

    game.stage.backgroundColor = '#eee'; 
}

function create() {

    //  we use this function to enable input from the keys. 
    //  one for each keyboard key!
    keys[0] = game.input.keyboard.addKey(Phaser.Keyboard.A); //0
    keys[1] = game.input.keyboard.addKey(Phaser.Keyboard.G); //6
    keys[3] = game.input.keyboard.addKey(Phaser.Keyboard.I); //8
    keys[2]= game.input.keyboard.addKey(Phaser.Keyboard.L); //11
    keys[4]= game.input.keyboard.addKey(Phaser.Keyboard.W); //22

    // Phaser.ArrayUtils.shuffle(toastFrames);

    //  we'll create an empty group to hold all the platforms.
    //  this will make it easy to do things to all the platforms at once
    platforms = game.add.group();

    //  Now we're ready to make the platforms, using a loop where i will go from 0 to numPlatforms
    for (var i=0;i<numPlatforms; i++){

        //  create a new platform, storing it in a temporary local variable 'newPlatform' 
        var newPlatform = platforms.create(0,0,'platformSprite');

        //  by default, the position of a sprite is its top-left corner, 
        //  but in this case I want to center the platform
        //  around its x-position, so I move its 'anchor' to the middle of the sprite
        newPlatform.anchor.setTo(0.5,0.5);

        newPlatform.frame = toastFrames[i];

        newPlatform.alreadyBouncedOn = false;

    }

    menu = game.add.tileSprite(0, 0, 1024, 1024, 'menubackground');
    menu.alpha=0.9;
    startMenu = game.add.tileSprite(game.width*0.5-800/2, game.height*0.50-400/2, 800,400, 'menuStart');
    startMenu.alpha=1;
    endMenu = game.add.tileSprite(game.width*0.5-800/2, game.height*0.50-400/2, 800,400,'menuEnd');
    endMenu.alpha=0;
    
    var style = {font: 'bold 20pt monospace',
                 fill: '#8D703D',
                 align: 'left'};
    scoreDisplay = game.add.text(game.width/2,20, "score: \nlife: ", style);
    scoreDisplay.anchor.setTo(0,0);

    //  initialize the variable for the jump sound - we'll use this object to play the sound
    jumpAudio = game.add.audio('jumpSound');

    initialize();
}

function initialize(){
    //  set the player's score to zero
    score = 0;
    life=100;
    scoreText = "";
    scoreDisplay.y=20;

    // smiley.scale = new Phaser.Point(0.1,0.1);
    // smiley.body.setCircle(smiley.width/2,-smiley.width/2,-smiley.height/2);
    //these are arbitrary #s that just work.
    // smiley.body.setCircle(smiley.width/2);//,smiley.width*4+60,smiley.height*4+60);

    // Phaser.ArrayUtils.shuffle(toastFrames);
    placeToasts();
}

function placeToasts(){
    var i=0;
    platforms.forEach(function(p){
        i = i+1;

        var horizontal_location = 200+i*40;
        var vertical_location = 150;
        if (i>3){
            vertical_location=300;
            horizontal_location = 200 + (i-3)*40;
        }

        p.position = new Phaser.Point(horizontal_location,vertical_location);

        p.tint=0x999999;
        p.alreadyBouncedOn = false;
        p.revive();
    });

    platforms.children[3].alpha=0;
    platforms.children[3].tint=0xffffff;
    platforms.children[4].alpha=0;
    platforms.children[4].tint=0xffffff;
}


function update() {

    if (mode == 'start'){
        if (keys[0].isDown){
            mode = 'game';
            menu.alpha=0;
            startMenu.alpha=0;
        }
    }else if (mode == 'game'){

        scoreDisplay.setText("score: "+score+"\nlife: "+Math.round(life));

        //chance 1/10 that you will have to press either i or w (which is 50/50)
        if (clear){
            if (Math.floor(Math.random()*10)==1){
                console.log("incoming");
                var which = Math.floor(Math.random()*2);
                // platforms.children[3+which].tint=0xffffff;
                platforms.children[3+which].alpha=1;
                clear=false;
                target=3+which;
            }
        }
        life = life-0.2;
        for (var i=0;i<numPlatforms; i++){
            platforms.children[cycle].tint=0xffffff;


            if (keys[i].isDown){
                // console.log(i,keys[i]);
                if (i==cycle){ //you hit the right key
                    if (life<100)
                        life = life+1;
                    platforms.children[cycle].tint=0x999999;
                    cycle=cycle+1;
                    if (cycle>2)
                        cycle=0;
                }
                if (i==target && !clear){
                    // platforms.children[target].tint=0x999999;
                    platforms.children[target].alpha=0;
                    clear=true;
                    score = score+1;
                }

                var j=0;
                platforms.forEach(function(p){
                    if (j==i) 
                        p.scale=new Phaser.Point(1.2,1.2);
                    j=j+1;
                });
            } else {
                var j=0;
                platforms.forEach(function(p){
                    if (j==i) 
                        p.scale=new Phaser.Point(1,1);
                    j=j+1;
                })
            }
        }
        

        if (life > 0){
            
        } else{ 
            mode = 'end';
            menu.alpha=0.8;
            endMenu.alpha=1;
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
    
    //  this is a useful way to draw placeholder text in Phaser, but don't use it for a finished game! It's ugly.
    // game.debug.text(scoreText, 32, 32); //the numbers control where the text is drawn

    //  for debugging purposes, we might want to show the collision boxes for the bodies in the game
    //  this code will only run if the variable DEBUG (set at the top) is true
    if (DEBUG == true){ //show debug bodies
        game.debug.body(smiley); //this function draws the body's collision box

        //now let's do the same thing for every member of the platforms group that is currently alive
        platforms.forEachAlive(function(p){game.debug.body(p);},this);    
    }
}

