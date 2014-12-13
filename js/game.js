
var gameOver = function(game){
	console.log("GAME OVER");
	return {
		create: function(){
			var gameTitle = this.game.add.sprite(420,200,"gameOver");
			gameTitle.anchor.setTo(0.5,0.5);
			
			gameOverText = game.add.text(400, 400, 'Game Over');
			gameOverText.fixedToCamera = true;
		},
		update: function() 
		{
			if (game.input.activePointer.isDown)
			{
				this.game.state.start("GameTitle");
			}
		}
	}
}

var introScreen = function(game){
	var intro, atPart2 = false;
	
	function nextSlide() {
		this.intro.loadTexture('intro2', 0);
		this.atPart2 = true;
		
		game.input.onDown.addOnce(nextState, this);
	}
	
	function nextState() {
		this.game.state.start("TheGame");
	}
	
	return {
		create: function(){
			this.intro = this.game.add.sprite(400,300,"intro1");
			this.intro.anchor.setTo(0.5,0.5);
			
			game.input.onDown.addOnce(nextSlide, this);
		}
	}
}

var winScreen = function(game){
	return {
		create: function(){
			var gameTitle = this.game.add.sprite(400,300,"winner");
			gameTitle.anchor.setTo(0.5,0.5);
		},
		update: function() 
		{
			if (game.input.activePointer.isDown)
			{
				this.game.state.start("GameTitle");
			}
		}
	}
}

var theGame = function(game) {

	var player;
	var platforms;
	var cursors;

	var stars, goal;
	var horsePower = 0;
	var horsePowerText;
	
	var controlsText;
	
	function aWinnerIsYou(player, flag) {
		this.game.state.start("WinScreen");
	}
	
	function collectStar (player, star) {
		
		// Removes the star from the screen
		star.kill();

		//  Add and update the horsePower
		horsePower += 10;
		horsePowerText.text = 'Horse Power: ' + horsePower;

	}

	return {
		create: function() {

			//  We're going to be using physics, so enable the Arcade Physics system
			game.physics.startSystem(Phaser.Physics.ARCADE);

			//  A simple background for our game
			
			//game.add.sprite(0, 0, 'sky');
			sky = game.add.tileSprite(0, 0, 800, 600, 'sky');
			sky.fixedToCamera = true;
			
			map = game.add.tilemap('level1');
			map.addTilesetImage('tileset');
			
			layer = map.createLayer('ground'); // This is the default name of the first layer in Tiled
			layer.resizeWorld(); // Sets the world size to match the size of this layer.
			map.setCollisionBetween(0, 100);

			// The player and its settings
			player = game.add.sprite(64, game.world.height - 450, 'dude');

			//  We need to enable physics on the player
			game.physics.arcade.enable(player);

			//  Player physics properties. Give the little guy a slight bounce.
			player.body.bounce.y = 0.1;
			player.body.gravity.y = 700;
			player.body.collideWorldBounds = true;

			//  Our two animations, walking left and right.
			player.animations.add('left', [0, 1, 2, 3], 10, true);
			player.animations.add('right', [5, 6, 7, 8], 10, true);

			//  Finally some stars to collect
			stars = game.add.group();
			stars.enableBody = true;

			//  And now we convert all of the Tiled objects with an ID of 34 into sprites within the coins group
			map.createFromObjects('stars', 2, 'star', 0, true, false, stars);

			//  We will enable physics for any star that is created in this group
			stars.enableBody = true;

			//  Here we'll create 12 of them evenly spaced apart
			stars.forEach(function(star) {
				star.body.gravity.y = 400;
				star.body.bounce.y = 0.7 + Math.random() * 0.2;
			});
			
			//  Finally some stars to collect
			goal = game.add.group();
			goal.enableBody = true;

			//  And now we convert all of the Tiled objects with an ID of 34 into sprites within the coins group
			map.createFromObjects('goal', 18, 'flag', 0, true, false, goal);
			map.createFromObjects('goal', 34, 'flagpost', 3, true, false, goal);
			
			//  The horsePower
			horsePowerText = game.add.text(16, 16, 'Horse Power: 0', { fontSize:'32px', fill: '#2' });
			horsePowerText.fixedToCamera = true;
			
			controlsText = game.add.text(16, 50,  'Move with arrow keys\nNo shooting (Horse is unarmed)', { font: '16px monospace', fill: '#333' });
			controlsText.fixedToCamera = true;
			//  Our controls.
			cursors = game.input.keyboard.createCursorKeys();
			
			game.camera.follow(player);
		},
		update: function() {
			//  Collide the player and the stars with the platforms
			game.physics.arcade.collide(player, layer);
			game.physics.arcade.collide(stars, layer);

			//  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
			game.physics.arcade.overlap(player, stars, collectStar, null, this);
			game.physics.arcade.overlap(player, goal, aWinnerIsYou, null, this);

			//  Reset the players velocity (movement)
			player.body.velocity.x = 0;

			if (cursors.left.isDown)
			{
				//  Move to the left
				player.body.velocity.x = -150;

				player.animations.play('left');
			}
			else if (cursors.right.isDown)
			{
				//  Move to the right
				player.body.velocity.x = 150;

				player.animations.play('right');
			}
			else
			{
				//  Stand still
				player.animations.stop();

				player.frame = 4;
			}
			
			//  Allow the player to jump if they are touching the ground.
			if (cursors.up.isDown && player.body.blocked.down)
			{
				player.body.velocity.y = -350 - 1.5*horsePower;
				
				if ( player.body.velocity.y < -600 )
					player.body.velocity.y = -600;
			}
			
			if ( player.body.y > 1500 )
				this.game.state.start("GameOver");

		}
	}
}

var boot = function(game){
	console.log("%cEmbarking on perilous journey...", "color:white; background:red");
	return {
	preload: function () {
		//load assets for the loading screen
		 this.load.image('preloaderBar', 'assets/platform.png');
		 
		 },
		create: function(){
			this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
			this.scale.pageAlignHorizontally = true;
			this.scale.setScreenSize();
			this.game.state.start("PreloadAssets");
		}
	}
}

var preload = function(game) {
	return {
		preload: function(){ 
			game.load.image('titleLogo', 'assets/logo.png');
			game.load.image('titleFooter', 'assets/titleFooter.png');
			game.load.image('titlePlayer', 'assets/titlePlayer.png');
			game.load.image('gameOver', 'assets/gameOver.png');

			game.load.image('flag', 'assets/flag.png');
			game.load.image('flagpost', 'assets/flagpost.png');

			game.load.image('winner', 'assets/winScreen.png');
			
			game.load.image('intro1', 'assets/intro1.png');
			game.load.image('intro2', 'assets/intro2.png');
			
			game.load.image('sky', 'assets/sky.png');
			game.load.image('ground', 'assets/platform.png');
			game.load.image('star', 'assets/star.png');
			game.load.spritesheet('dude', 'assets/horse.png', 64, 96);
			
			game.load.spritesheet('snowflakes', 'assets/snowflakes.png', 17, 17);
			game.load.spritesheet('snowflakes_large', 'assets/snowflakes_large.png', 64, 64);
			
			game.load.image('tileset', 'assets/tileset.png');
			game.load.tilemap('level1', 'assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
			
			this.preloadBar = this.add.sprite(this.world.centerX, this.world.centerY, 'preloaderBar');
			this.preloadBar.anchor.setTo(0,0.5);
			this.preloadBar.scale.setTo(0.5,1);
			this.preloadBar.x = this.world.centerX - this.preloadBar.width/2;
			this.load.setPreloadSprite(this.preloadBar);
		},
		create: function(){
			this.game.state.start("GameTitle");
		}
	}
}

var gameTitle = function(game){
	var max = 0;
	var front_emitter;
	var mid_emitter;
	var back_emitter;
	var update_interval = 4 * 60;
	var i = 0;
	
	function changeWindDirection() {
		var multi = Math.floor((max + 200) / 4),
			frag = (Math.floor(Math.random() * 100) - multi);
		max = max + frag;

		if (max > 200) max = 150;
		if (max < -200) max = -150;

		setXSpeed(back_emitter, max);
		setXSpeed(mid_emitter, max);
		setXSpeed(front_emitter, max);
	}

	function setXSpeed(emitter, max) {
		emitter.setXSpeed(max - 20, max);
		emitter.forEachAlive(setParticleXSpeed, this, max);
	}

	function setParticleXSpeed(particle, max) {
		particle.body.velocity.x = max - Math.floor(Math.random() * 30);
	}

	return {
		
		create: function(){
			var gameTitle = this.game.add.sprite(420,200,"titleLogo");
			gameTitle.anchor.setTo(0.5,0.5);
			var playButton = this.game.add.button(400,360,"titlePlayer",this.playTheGame,this);
			playButton.anchor.setTo(0.5,0.5);
			var footer = this.game.add.sprite(300,500,"titleFooter");
			gameTitle.anchor.setTo(0.5,0.5);
			
			back_emitter = game.add.emitter(game.world.centerX, -32, -100);
			back_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
			back_emitter.maxParticleScale = 0.6;
			back_emitter.minParticleScale = 0.2;
			back_emitter.setYSpeed(20, 100);
			back_emitter.gravity = 0;
			back_emitter.width = game.world.width * 1.5;
			back_emitter.minRotation = 0;
			back_emitter.maxRotation = 40;

			mid_emitter = game.add.emitter(game.world.centerX, -32, 250);
			mid_emitter.makeParticles('snowflakes', [0, 1, 2, 3, 4, 5]);
			mid_emitter.maxParticleScale = 1.2;
			mid_emitter.minParticleScale = 0.8;
			mid_emitter.setYSpeed(50, 150);
			mid_emitter.gravity = 0;
			mid_emitter.width = game.world.width * 1.5;
			mid_emitter.minRotation = 0;
			mid_emitter.maxRotation = 40;

			front_emitter = game.add.emitter(game.world.centerX, -32, 50);
			front_emitter.makeParticles('snowflakes_large', [0, 1, 2, 3, 4, 5]);
			front_emitter.maxParticleScale = 1;
			front_emitter.minParticleScale = 0.5;
			front_emitter.setYSpeed(100, 200);
			front_emitter.gravity = 0;
			front_emitter.width = game.world.width * 1.5;
			front_emitter.minRotation = 0;
			front_emitter.maxRotation = 40;

			changeWindDirection();

			back_emitter.start(false, 14000, 20);
			mid_emitter.start(false, 12000, 40);
			front_emitter.start(false, 6000, 1000);
		},
		update: function() {

			if (game.input.activePointer.isDown)
			{
				this.playTheGame();
			}
			
			i++;

			if (i === update_interval)
			{
				changeWindDirection();
				update_interval = Math.floor(Math.random() * 20) * 60; // 0 - 20sec @ 60fps
				i = 0;
			}

		},
		playTheGame: function(){
			this.game.state.start("IntroScreen");
		}
	}
}



var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');
game.state.add("Boot", boot);
game.state.add("PreloadAssets", preload);
game.state.add("GameTitle", gameTitle);
game.state.add("IntroScreen", introScreen);
game.state.add("TheGame", theGame);
game.state.add("GameOver", gameOver);
game.state.add("WinScreen", winScreen);
game.state.start("Boot");
