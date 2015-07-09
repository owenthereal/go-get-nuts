var bootState = {
  preload: function () {
    game.load.image('progressBar', 'assets/progressBar.png');
  },

  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    document.body.style.backgroundColor = '#3498db';

    game.scale.minWidth = 250;
    game.scale.minHeight = 170;
    game.scale.maxWidth = 1000;
    game.scale.maxHeight = 680;

    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);

    game.state.start('load');
  }
};
