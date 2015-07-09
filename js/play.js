var playState = {
  create: function() {
    this.cursor = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT]);
    this.wasd = {
      up: game.input.keyboard.addKey(Phaser.Keyboard.W),
      left: game.input.keyboard.addKey(Phaser.Keyboard.A),
      right: game.input.keyboard.addKey(Phaser.Keyboard.D)
    };

    game.global.score = 0;
    this.createWorld();
    if (!game.device.desktop) {
      this.addMobileInputs();
    }

    this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
    game.physics.arcade.enable(this.player);
    this.player.anchor.setTo(0.5, 0.5);
    this.player.body.gravity.y = 500;
    this.player.animations.add('right', [1, 2], 8);
    this.player.animations.add('left', [3, 4], 8);

    this.enemies = game.add.group();
    this.enemies.enableBody = true;
    this.enemies.createMultiple(10, 'enemy');

    this.coin = game.add.sprite(60, 140, 'coin');
    game.physics.arcade.enable(this.coin);
    this.coin.anchor.setTo(0.5, 0.5);

    this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });

    this.emitter = game.add.emitter(0, 0, 15);
    this.emitter.makeParticles('pixel');
    this.emitter.setYSpeed(-150, 150);
    this.emitter.setXSpeed(-150, 150);
    this.emitter.gravity = 0;

    this.jumpSound = game.add.audio('jump');
    this.coinSound = game.add.audio('coin');
    this.deadSound = game.add.audio('dead');

    this.nextEnemy = 0;
  },

  update: function() {
    game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
    game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
    game.physics.arcade.collide(this.player, this.layer);
    game.physics.arcade.collide(this.enemies, this.layer);

    if (!this.player.inWorld) {
      this.playerDie();
    }

    this.movePlayer();

    if (this.nextEnemy < game.time.now) {
      var start = 4000, end = 1000, score = 100;
      var delay = Math.max(start - (start-end)*game.global.score/score, end);

      this.addEnemy();
      this.nextEnemy = game.time.now + delay;
    }
  },

  movePlayer: function() {
    if (this.cursor.left.isDown || this.wasd.left.isDown || this.moveLeft) {
      this.player.body.velocity.x = -200;
      this.player.animations.play('left');
    }
    else if (this.cursor.right.isDown || this.wasd.right.isDown || this.moveRight) {
      this.player.body.velocity.x = 200;
      this.player.animations.play('right');
    }
    else {
      this.player.body.velocity.x = 0;
      this.player.animations.stop();
      this.player.frame = 0;
    }

    if (this.cursor.up.isDown || this.wasd.up.isDown) {
      this.jumpPlayer();
    }
  },

  jumpPlayer: function() {
    if (this.player.body.onFloor()) {
      this.jumpSound.play();
      this.player.body.velocity.y = -320;
    }
  },

  addEnemy: function() {
    var enemy = this.enemies.getFirstDead();
    if (!enemy) {
      return;
    }

    enemy.anchor.setTo(0.5, 1);
    enemy.reset(game.world.centerX, 0);
    enemy.body.gravity.y = 500;
    enemy.body.bounce.x = 1;
    enemy.body.velocity.x = 100 * Phaser.Math.randomSign();

    enemy.checkWorldBounds = true;
    enemy.outOfBoundsKill = true;
  },

  takeCoin: function(player, coin) {
    game.global.score += 5;
    this.scoreLabel.text = 'score: ' + game.global.score;

    this.updateCoinPosition();

    this.coinSound.play();
    game.add.tween(this.player.scale).to({x:1.3, y:1.3}, 50).to({x:1, y:1}, 150).start();
    this.coin.scale.setTo(0, 0);
    game.add.tween(this.coin.scale).to({x: 1, y:1}, 300).start();
  },

  updateCoinPosition: function() {
    var coinPosition = [
      {x: 140, y: 60}, {x: 360, y: 60},
      {x: 60, y: 140}, {x: 440, y: 140},
      {x: 130, y: 300}, {x: 370, y: 300}
    ];

    for (var i = 0; i < coinPosition.length; i++) {
      if (coinPosition[i].x === this.coin.x) {
        coinPosition.splice(i, 1);
      }
    }

    var newPosition = coinPosition[game.rnd.integerInRange(0, coinPosition.length-1)];
    this.coin.reset(newPosition.x, newPosition.y);
  },

  playerDie: function() {
    if (!this.player.alive) {
      return;
    }

    this.player.kill();

    this.deadSound.play();
    this.emitter.x = this.player.x;
    this.emitter.y = this.player.y;
    this.emitter.start(true, 600, null, 15);

    game.time.events.add(1000, this.startMenu, this);
  },

  startMenu: function() {
    game.state.start('menu');
  },

  createWorld: function() {
    this.map = game.add.tilemap('map');
    this.map.addTilesetImage('tileset');
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();
    this.map.setCollision(1);
  },

  addMobileInputs: function() {
    this.jumpButton = game.add.sprite(350, 247, 'jumpButton');
    this.jumpButton.inputEnabled = true;
    this.jumpButton.events.onInputDown.add(this.jumpPlayer, this);
    this.jumpButton.alpha = 0.5;

    this.moveLeft = false;
    this.moveRight = false;

    this.leftButton = game.add.sprite(50, 247, 'leftButton');
    this.leftButton.inputEnabled = true;
    this.leftButton.events.onInputOver.add(function(){this.moveLeft=true;}, this);
    this.leftButton.events.onInputOut.add(function(){this.moveLeft=false;}, this);
    this.leftButton.events.onInputDown.add(function(){this.moveLeft=true;}, this);
    this.leftButton.events.onInputUp.add(function(){this.moveLeft=false;}, this);
    this.leftButton.alpha = 0.5;

    this.rightButton = game.add.sprite(130, 247, 'rightButton');
    this.rightButton.inputEnabled = true;
    this.rightButton.events.onInputOver.add(function(){this.moveRight=true;}, this);
    this.rightButton.events.onInputOut.add(function(){this.moveRight=false;}, this);
    this.rightButton.events.onInputDown.add(function(){this.moveRight=true;}, this);
    this.rightButton.events.onInputUp.add(function(){this.moveRight=false;}, this);
    this.rightButton.alpha = 0.5;
  }
};
