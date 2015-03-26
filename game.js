// CamelGame constructor --------------------------------------------

var CamelGame =  function () {
   this.canvas = document.getElementById('game-canvas'),
   this.canvas.width = window.innerWidth;
   this.canvas.height = window.innerHeight;
   this.context = this.canvas.getContext('2d'),

   // HTML elements........................................................

   this.fpsElement = document.getElementById('fps'),
   this.toast = document.getElementById('toast'),

   // Constants............................................................

   this.LEFT = 1,
   this.RIGHT = 2,
   this.STATIONARY = 3,

   // Constants are listed in alphabetical order from here on out

   this.BACKGROUND_VELOCITY = 100,
   this.DEFAULT_TOAST_TIME = 1000,

   this.PAUSED_CHECK_INTERVAL = 200,

   this.RUNNER_HEIGHT = 142,
       this.RUNNER_CELLS_HEIGHT = 142,

   this.STARTING_BACKGROUND_VELOCITY = 0,

   this.STARTING_BACKGROUND_OFFSET = 0,
       this.INITIAL_BACKGROUND_OFFSET = 0,

   this.STARTING_RUNNER_LEFT = 50,
   this.STARTING_PAGEFLIP_INTERVAL = -1,
   this.STARTING_RUNNER_TRACK = 1,
   this.STARTING_RUNNER_VELOCITY = 0,

   // Paused............................................................

   this.paused = false,
   this.pauseStartTime = 0,
   this.totalTimePaused = 0,

   this.windowHasFocus = true,

   // Track baselines...................................................

   this.TRACK_1_BASELINE = this.canvas.height,
   this.TRACK_2_BASELINE = this.canvas.height / 4 * 3,
   this.TRACK_3_BASELINE = this.canvas.height / 4 * 2,

   // Fps indicator.....................................................

   this.fpsToast = document.getElementById('fps'),

   // Images............................................................

   this.background  = new Image(),
   this.runnerImage = new Image(),
       this.spritesheet = new Image(),
   // Time..............................................................

   this.lastAnimationFrameTime = 0,
   this.lastFpsUpdateTime = 0,
   this.fps = 60,

   // Runner track......................................................

   this.runnerTrack = this.STARTING_RUNNER_TRACK,

   // Pageflip timing for runner........................................

   this.runnerPageflipInterval = this.STARTING_PAGEFLIP_INTERVAL,

   // Scrolling direction...............................................

   this.scrollingDirection = this.STATIONARY,

   // Translation offsets...............................................

   this.backgroundOffset = this.STARTING_BACKGROUND_OFFSET,
       this.spriteOffset = this.INITIAL_BACKGROUND_OFFSET,

   // Velocities........................................................

   this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY;

// Sprite artists...................................................
  //  this.runner.runAnimationRate = 17; //fps
    /*this.camelCells = [
        {left: 0, top: 90, width: 64, height: 50},
        {left: 128, top: 90, width: 73, height: 50},
        {left: 201, top: 90, width: 73, height: 50},
        {left: 274, top: 90, width: 64, height: 50}
    ];*/
    this.posSpriteTop=159;
    this.SpriteHeight=92;
    this.camelCells = [
     //   {left: 0, top: this.posSpriteTop, width: 112, height: this.SpriteHeight},  //1
        {left: 114, top: this.posSpriteTop, width: 120, height: this.SpriteHeight},  //2
        {left: 232, top: this.posSpriteTop, width: 126, height: this.SpriteHeight},  //3
        {left: 360, top: this.posSpriteTop, width: 130, height: this.SpriteHeight},  //4
        {left: 490, top: this.posSpriteTop, width: 130, height: this.SpriteHeight},  //5
        {left: 625, top: this.posSpriteTop, width: 135, height: this.SpriteHeight},  //6
        {left: 760, top: this.posSpriteTop, width: 137, height: this.SpriteHeight},  //7
        {left: 898, top: this.posSpriteTop, width: 135, height: this.SpriteHeight},  //8
    ];

    this.runnerArtist = new SpriteSheetArtist(this.spritesheet, this.camelCells);
//    this.runnerArtist.cells = this.camelCells;
  /*  this.platformArtist = {
        draw: function (sprite, context) {
            var top;

            context.save();

            top = this.calculatePlatformTop(sprite.track);

            context.lineWidth = this.PLATFORM_STROKE_WIDTH;
            context.strokeStyle = snailBait.PLATFORM_STROKE_STYLE;
            context.fillStyle = sprite.fillStyle;

            context.strokeRect(sprite.left, top, sprite.width, sprite.height);
            context.fillRect  (sprite.left, top, sprite.width, sprite.height);

            context.restore();
        }
    },*/

        // Sprite behaviors.................................................

        this.runBehavior = {
            // Every runAnimationRate milliseconds, this behavior advances the
            // runner's artist to the next frame of the spritesheet, provided the
            // runner is not jumping or falling.
            //
            // This behavior is similar to the more general Cycle behavior in
            // js/behaviors. The difference is that this behavior does not advance
            // the sprite's artist if the sprite is jumping, falling, or the
            // runner's runAnimationRate is 0.

            lastAdvanceTime: 0,

            execute: function(sprite, time, fps) {
                // Realize that this is a method in an object (runBehavior), that resides
                // in another object (snailBait), so the 'this' reference in this method
                // refers to runBehavior, not snailBait.

                if (sprite.runAnimationRate === 0) {
                    return;
                }

                if (this.lastAdvanceTime === 0) {  // skip first time
                    this.lastAdvanceTime = time;
                }
                else if (time - this.lastAdvanceTime > 1000 / sprite.runAnimationRate) {
                    sprite.artist.advance();
                    this.lastAdvanceTime = time;
                }
            }
        },

        this.upBehavior = {
            execute: function(sprite, time, fps) {
                if (sprite.jumping) {
                    if (sprite.track !== 3) {
                        sprite.track++;
                    }
                    sprite.top = CamelGame.calculatePlatformTop(sprite.track) -  CamelGame.RUNNER_CELLS_HEIGHT;

                    sprite.jumping = false; // immediately done jumping for now
                }
            }
        },

        this.dawnBehavior = {
            execute: function(sprite, time, fps) {
                if (sprite.falling) {
                    if (sprite.track !== 1) {
                        sprite.track--;
                    }
                    sprite.top = CamelGame.calculatePlatformTop(sprite.track) -  CamelGame.RUNNER_CELLS_HEIGHT;

                    sprite.falling = false; // immediately done falling for now
                }
            }
        },

        this.paceBehavior = {
            checkDirection: function (sprite) {
                var sRight = sprite.left + sprite.width,
                    pRight = sprite.platform.left + sprite.platform.width;

                if (sRight > pRight && sprite.direction === this.RIGHT) {
                    sprite.direction = this.LEFT;
                }
                else if (sprite.left < sprite.platform.left &&
                    sprite.direction === this.LEFT) {
                    sprite.direction = this.RIGHT;
                }
            },

            moveSprite: function (sprite, fps) {
                var pixelsToMove = sprite.velocityX / fps;

                if (sprite.direction === this.RIGHT) {
                    sprite.left += pixelsToMove;
                }
                else {
                    sprite.left -= pixelsToMove;
                }
            },

            execute: function (sprite, time, fps) {
                this.checkDirection(sprite);
                this.moveSprite(sprite, fps);
            }
        },

        this.snailShootBehavior = { // sprite is the snail
            execute: function (sprite, time, fps) {
                var bomb = sprite.bomb;

                if (! bomb.visible && sprite.artist.cellIndex === 2) {
                    bomb.left = sprite.left;
                    bomb.visible = true;
                }
            }
        },

       /* this.snailBombMoveBehavior = {
            execute: function(sprite, time, fps) {  // sprite is the bomb
                if (sprite.visible && this.spriteInView(sprite)) {
                    sprite.left -= this.SNAIL_BOMB_VELOCITY / fps;
                }

                if (!this.spriteInView(sprite)) {
                    sprite.visible = false;
                }
            }
        },*/

        // Sprites...........................................................

        this.runner = new Sprite('runner',          // type
            this.runnerArtist, // artist
            [ this.runBehavior, // behaviors
                this.upBehavior,
                this.dawnBehavior
            ]);

    // All sprites.......................................................
    //
    // (addSpritesToSpriteArray() adds sprites from the preceding sprite
    // arrays to the sprites array)

    this.sprites = [ this.runner ];

   /* this.explosionAnimator = new SpriteAnimator(
        this.explosionCells,          // Animation cells
        this.EXPLOSION_DURATION,      // Duration of the explosion
        function (sprite, animator) { // Callback after animation
            sprite.exploding = false;
        }
    );*/
};


// CamelGame.prototype ----------------------------------------------------


CamelGame.prototype = {
   // Drawing..............................................................

   draw: function (now) {
      this.setTranslationOffsets();

      this.drawBackground();
    //  this.drawRunner();

       //sprites
       this.updateSprites(now);
       this.drawSprites();
   },

   drawRunner: function () {
      this.context.drawImage(
         this.runnerImage,
         this.STARTING_RUNNER_LEFT,
         this.canvas.clientHeight / 4 * (5 - this.runnerTrack) - this.RUNNER_HEIGHT //remove magic numbers
        );
   },

    setPlatformVelocity: function () {
        this.platformVelocity = this.bgVelocity * 4.35;
    },

   setTranslationOffsets: function () {
      this.setBackgroundTranslationOffset();
       this.setSpriteTranslationOffsets();
   },

   setBackgroundTranslationOffset: function () {
      var offset = this.backgroundOffset + this.bgVelocity/this.fps;
   
      //if (offset > 0 && offset < this.background.width) {
      if (offset > 0 && offset < this.canvas.clientWidth) {
         this.backgroundOffset = offset;
      }
      else {
         this.backgroundOffset = 0;
      }
   },

    setSpriteTranslationOffsets: function () {
        var i, sprite;

        this.spriteOffset += this.platformVelocity / this.fps; // In step with platforms

        for (i=0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if ('runner' !== sprite.type) {
                sprite.offset = this.spriteOffset;
            }
        }
    },
   
   drawBackground: function () {
      this.context.save();
   
      this.context.globalAlpha = 1.0;
      this.context.translate(-this.backgroundOffset, 0);
   
      // Initially onscreen:
      //this.context.drawImage(this.background, 0, 0, this.background.width, this.background.height);
      this.context.drawImage(this.background, 0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
   
      // Initially offscreen:
      //this.context.drawImage(this.background, this.background.width, 0, this.background.width+1, this.background.height);
      this.context.drawImage(this.background, this.canvas.clientWidth, 0, this.canvas.clientWidth+1, this.canvas.clientHeight);
   
      this.context.restore();
   },
   
   calculateFps: function (now) {
      var fps;

      if (this.lastAnimationFrameTime === 0) {
         this.lastAnimationFrameTime = now;
         return 60;
      }

      fps = 1000 / (now - this.lastAnimationFrameTime);
      this.lastAnimationFrameTime = now;
   
      if (now - this.lastFpsUpdateTime > 1000) {
         this.lastFpsUpdateTime = now;
         this.fpsElement.innerHTML = fps.toFixed(0) + ' fps';
      }

      return fps; 
   },

    calculatePlatformTop: function (track) {
        var top;

        if      (track === 1) { top = this.TRACK_1_BASELINE; }
        else if (track === 2) { top = this.TRACK_2_BASELINE; }
        else if (track === 3) { top = this.TRACK_3_BASELINE; }

        return top;
    },

    turnRight: function () {
        this.bgVelocity = this.BACKGROUND_VELOCITY;
        this.runner.runAnimationRate = 10;
        this.runnerArtist.cells = this.camelCells;
        this.runner.direction = this.RIGHT;
    },

   // Sprites..............................................................
 
   explode: function (sprite, silent) {
      sprite.exploding = true;
      this.explosionAnimator.start(sprite, true);  // true means sprite reappears
   },

    equipRunner: function () {
        this.runner.runAnimationRate =
            0,

            this.runner.track = 1;
        this.runner.direction = this.LEFT;
        this.runner.velocityX = 0;
        this.runner.left = 50;
        this.runner.top = this.calculatePlatformTop(this.runner.track) -
        this.RUNNER_CELLS_HEIGHT;

        this.runner.artist.cells = this.camelCells;

        this.runner.jumping = false;
        this.runner.falling = false;

        this.runner.jump = function () {
            // this method is essentially a switch that turns
            // on the runner's jumping behavior

            this.jumping = !this.jumping // 'this' is the runner
        };

        this.runner.fall = function () {
            // this method is essentially a switch that turns
            // on the runner's falling behavior

            this.falling = !this.falling // 'this' is the runner
        };
    },



   // Toast................................................................

   splashToast: function (text, howLong) {
      howLong = howLong || this.DEFAULT_TOAST_TIME;

      toast.style.display = 'block';
      toast.innerHTML = text;

      setTimeout( function (e) {
         if (CamelGame.windowHasFocus) {
            toast.style.opacity = 1.0; // After toast is displayed
         }
      }, 50);

      setTimeout( function (e) {
         if (CamelGame.windowHasFocus) {
            toast.style.opacity = 0; // Starts CSS3 transition
         }

         setTimeout( function (e) { 
            if (CamelGame.windowHasFocus) {
               toast.style.display = 'none'; 
            }
         }, 480);
      }, howLong);
   },

   // Pause................................................................

   togglePaused: function () {
      var now = +new Date();

      this.paused = !this.paused;
   
      if (this.paused) {
         this.pauseStartTime = now;
      }
      else {
         this.lastAnimationFrameTime += (now - this.pauseStartTime);
      }
   },

   // Animation............................................................

   animate: function (now) { 
      if (CamelGame.paused) {
         setTimeout( function () {
            requestNextAnimationFrame(CamelGame.animate);
         }, CamelGame.PAUSED_CHECK_INTERVAL);
      }
      else {
         CamelGame.fps = CamelGame.calculateFps(now); 
         CamelGame.draw(now);
         requestNextAnimationFrame(CamelGame.animate);
      }
   },

   // ------------------------- INITIALIZATION ----------------------------

   start: function () {
      //this.turnRight();
       this.createSprites();
       this.equipRunner();
      this.bgVelocity = this.BACKGROUND_VELOCITY;
      CamelGame.splashToast('Good Luck!', 2000);
this.turnRight();
      requestNextAnimationFrame(CamelGame.animate);
   },

   initializeImages: function () {
      this.background.src = 'images/background-l1.png';
   //   this.runnerImage.src = 'images/camel.png';
       this.spritesheet.src = 'images/sprite_camel_big.png';
      this.background.onload = function (e) {
         CamelGame.start();
      };
   },

    startGame: function () {
        requestNextAnimationFrame(this.animate);
    },

    updateSprites: function (now) {
        var sprite;

        for (var i=0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if (sprite.visible && this.spriteInView(sprite)) {
                sprite.update(now, this.fps);
            }
        }
    },

    drawSprites: function() {
        var sprite;

        for (var i=0; i < this.sprites.length; ++i) {
            sprite = this.sprites[i];

            if (sprite.visible && this.spriteInView(sprite)) {
                this.context.translate(-sprite.offset, 0);

                sprite.draw(this.context);

                this.context.translate(sprite.offset, 0);
            }
        }
    },

    spriteInView: function(sprite) {
        return sprite === this.runner || // runner is always visible
            (sprite.left + sprite.width > this.spriteOffset &&
            sprite.left < this.spriteOffset + this.canvas.width);
    },

    createSprites: function() {
      /*  this.createPlatformSprites(); // Platforms must be created first

        this.createBatSprites();
        this.createBeeSprites();
        this.createButtonSprites();
        this.createCoinSprites();
        this.createRubySprites();
        this.createSapphireSprites();
        this.createSnailSprites();
*/
        this.initializeSprites();

        this.addSpritesToSpriteArray();
    },

    initializeSprites: function() {
   /*     this.positionSprites(this.bats,       this.batData);
        this.positionSprites(this.bees,       this.beeData);
        this.positionSprites(this.buttons,    this.buttonData);
        this.positionSprites(this.coins,      this.coinData);
        this.positionSprites(this.rubies,     this.rubyData);
        this.positionSprites(this.sapphires,  this.sapphireData);
        this.positionSprites(this.snails,     this.snailData);

        this.armSnails();*/
    },

    addSpritesToSpriteArray: function () {
      /*  for (var i=0; i < this.platforms.length; ++i) {
            this.sprites.push(this.platforms[i]);
        }

        for (var i=0; i < this.bats.length; ++i) {
            this.sprites.push(this.bats[i]);
        }

        for (var i=0; i < this.bees.length; ++i) {
            this.sprites.push(this.bees[i]);
        }

        for (var i=0; i < this.buttons.length; ++i) {
            this.sprites.push(this.buttons[i]);
        }

        for (var i=0; i < this.coins.length; ++i) {
            this.sprites.push(this.coins[i]);
        }

        for (var i=0; i < this.rubies.length; ++i) {
            this.sprites.push(this.rubies[i]);
        }

        for (var i=0; i < this.sapphires.length; ++i) {
            this.sprites.push(this.sapphires[i]);
        }

        for (var i=0; i < this.snails.length; ++i) {
            this.sprites.push(this.snails[i]);
        }*/
    }

};
   
// Event handlers.......................................................
   
window.onkeydown = function (e) {
   var key = e.keyCode;

   if (key === 80 || (CamelGame.paused && key !== 80)) {  // 'p'
      CamelGame.togglePaused();
   }
   
   else if (key === 74) { // 'j'
      if (CamelGame.runnerTrack === 3) {
         return;
      }
CamelGame.runner.jump();
      CamelGame.runnerTrack++;
   }
   else if (key === 70) { // 'f'
      if (CamelGame.runnerTrack === 1) {
         return;
      }
       CamelGame.runner.fall();
      CamelGame.runnerTrack--;
   }
};

window.onblur = function (e) {  // pause if unpaused
   CamelGame.windowHasFocus = false;
   
   if (!CamelGame.paused) {
      CamelGame.togglePaused();
   }
};

window.onfocus = function (e) {  // unpause if paused
   var originalFont = CamelGame.toast.style.fontSize;

   CamelGame.windowHasFocus = true;

   if (CamelGame.paused) {
      CamelGame.toast.style.font = '128px fantasy';

      CamelGame.splashToast('3', 500); // Display 3 for one half second

      setTimeout(function (e) {
         CamelGame.splashToast('2', 500); // Display 2 for one half second

         setTimeout(function (e) {
            CamelGame.splashToast('1', 500); // Display 1 for one half second

            setTimeout(function (e) {
               if ( CamelGame.windowHasFocus) {
                  CamelGame.togglePaused();
               }

               setTimeout(function (e) { // Wait for '1' to disappear
                  CamelGame.toast.style.fontSize = originalFont;
               }, 2000);
            }, 1000);
         }, 1000);
      }, 1000);
   }
};

// Launch game.........................................................

var CamelGame = new CamelGame();
CamelGame.initializeImages();
CamelGame.start();
