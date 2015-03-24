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
   
   this.STARTING_BACKGROUND_VELOCITY = 0,

   this.STARTING_BACKGROUND_OFFSET = 0,

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
   
   // Velocities........................................................

   this.bgVelocity = this.STARTING_BACKGROUND_VELOCITY;
};


// CamelGame.prototype ----------------------------------------------------


CamelGame.prototype = {
   // Drawing..............................................................

   draw: function (now) {
      this.setTranslationOffsets();

      this.drawBackground();
      this.drawRunner();
   },

   drawRunner: function () {
      this.context.drawImage(
         this.runnerImage,
         this.STARTING_RUNNER_LEFT,
         this.canvas.clientHeight / 4 * (5 - this.runnerTrack) - this.RUNNER_HEIGHT //remove magic numbers
        );
   },

   setTranslationOffsets: function () {
      this.setBackgroundTranslationOffset();
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
   

   // Sprites..............................................................
 
   explode: function (sprite, silent) {
      sprite.exploding = true;
      this.explosionAnimator.start(sprite, true);  // true means sprite reappears
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
      this.bgVelocity = this.BACKGROUND_VELOCITY;
      CamelGame.splashToast('Good Luck!', 2000);

      requestNextAnimationFrame(CamelGame.animate);
   },

   initializeImages: function () {
      this.background.src = 'images/background-l1.png';
      this.runnerImage.src = 'images/camel.png';
   
      this.background.onload = function (e) {
         CamelGame.start();
      };
   },
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

      CamelGame.runnerTrack++;
   }
   else if (key === 70) { // 'f'
      if (CamelGame.runnerTrack === 1) {
         return;
      }

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
