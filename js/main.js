window.addEventListener('load', function(){
  HeyComeBack({
      hello: "oh hi!",
      goodbye: "i miss you ❤",
      goodbyeSeconds: 10
  });
});

cheat = null;

// todo: prototype the Chao and Items for perf later on
function Chao(options) {
  var context = options.context;

  var self = this;
  var sequence = 1;

  this.health = 65;
  this.speed = 45;
  this.mood = options.mood;
  this.moodIntensity = 1.0;
  this.desire = options.desire || { id: sequence, target: null, isAppeased: function () { return true; } };
  this.isBeingPushed = false;

  this.walkComplete = false;

  this.moveRandomly = function() {
    // Check if the Chao is currently being pushed or if a walk has already been completed
    if (!this.isBeingPushed && !this.walkComplete) {
        var directions = [
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 },  // Right
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: 1, y: 1 },  // Diagonal Right Down
            { x: -1, y: -1 },// Diagonal Left Up
            { x: 1, y: -1 }, // Diagonal Right Up
            { x: -1, y: 1 }, // Diagonal Left Down
        ];

        var randomIndex = Math.floor(Math.random() * directions.length);
        var randomDirection = directions[randomIndex];
        var distance = 50; // Distance the Chao will move

        var newX = this.sprite.x + randomDirection.x * distance;
        var newY = this.sprite.y + randomDirection.y * distance;

        // Ensure the Chao does not move outside the world bounds
        var halfWidth = this.sprite.width * 0.5;
        var halfHeight = this.sprite.height * 0.5;

        newX = Phaser.Math.clamp(newX, halfWidth, context.world.width - halfWidth);
        newY = Phaser.Math.clamp(newY, halfHeight, context.world.height - halfHeight);

        var duration = 1000; // Duration of the movement

        // Create and start the tween for moving the sprite
        var moveTween = context.add.tween(this.sprite).to({
            x: newX,
            y: newY
        }, duration, Phaser.Easing.Quadratic.Out, true);

        // Set up the onComplete callback for the tween
        moveTween.onComplete.add(() => {
          this.walkComplete = true;
          console.log("Movement completed");
      
          // Stop the walking animation and switch to an idle animation
          self.sprite.animations.stop(); // Stop any current animation
          self.sprite.animations.play('happy'); // Play a 'happy' animation, or any you see fit
    
          // If the logic for starting a new movement is conditional, manage walkComplete accordingly
          // For immediate continuous movement, you might not reset walkComplete here but under the trigger condition
          this.walkComplete = false; // Reset for the next movement, if immediately continuing
      }, this);
    }
};



this.sprite = context.add.sprite(
  context.world.centerX,
  context.world.centerY,
  'pet',
  'chao_006'
);
this.sprite.anchor.setTo(.5);

this.sprite.inputEnabled = true;
this.sprite.events.onInputDown.add(function() {
  if (window.kickActive) {
      this.sprite.animations.play('layingDown');
      this.isBeingPushed = true;

      var directions = [
          { x: -1, y: 0 }, // Left
          { x: 1, y: 0 },  // Right
          { x: 0, y: -1 }, // Up
          { x: 0, y: 1 },   // Down
          { x: 1, y: 1 },
          { x: -1, y: -1 },
          { x: 1, y: -1 },
          { x: -1, y: 1 },
      ];

      var randomIndex = Math.floor(Math.random() * directions.length);
      var randomDirection = directions[randomIndex];
      var distance = 50; // Adjust as needed

      // Initially calculate potential new position
      var newX = this.sprite.x + randomDirection.x * distance;
      var newY = this.sprite.y + randomDirection.y * distance;

      // Adjust for sprite size to prevent going out of bounds
      var halfWidth = this.sprite.width * 0.5;
      var halfHeight = this.sprite.height * 0.5;

      // Check and adjust for left or right boundary
      if (newX - halfWidth < 0 || newX + halfWidth > context.world.width) {
          randomDirection.x *= -1; // Reverse direction
      }

      // Check and adjust for top or bottom boundary
      if (newY - halfHeight < 0 || newY + halfHeight > context.world.height) {
          randomDirection.y *= -1; // Reverse direction
      }

      // Recalculate new position with direction possibly reversed
      newX = this.sprite.x + randomDirection.x * distance;
      newY = this.sprite.y + randomDirection.y * distance;

      // Final clamp to ensure Chao stays fully within bounds
      newX = Phaser.Math.clamp(newX, halfWidth, context.world.width - halfWidth);
      newY = Phaser.Math.clamp(newY, halfHeight, context.world.height - halfHeight);

      var duration = 1000; // Duration of the movement

      // Tween to move the sprite using the new, potentially reversed direction
      var moveTween = context.add.tween(this.sprite).to({
          x: newX,
          y: newY
      }, duration, Phaser.Easing.Quadratic.Out, true);
  } else if (window.petActive) {
      this.sprite.animations.play("pet");
  }
}, this);



this.sprite.animations.add(
  'chaoPet', 
  Phaser.Animation.generateFrameNames('chao_', 32, 34, '', 3), // Assuming frames 32 to 34 are for petting
  1, // Frame rate
  false // Don't loop this animation
);

this.sprite.animations.add(
  'walkDown', 
  Phaser.Animation.generateFrameNames('chao_', 0, 1, '', 3),
  this.speed * .14,
  true,
  false
);

var layingDown = this.sprite.animations.add(
  'layingDown', 
  Phaser.Animation.generateFrameNames('chao_', 25, 25, '', 3),
  this.speed * .05,
  false, // Set loop to true
  false
);

var layingDownAnimation = this.sprite.animations.getAnimation('layingDown');
layingDownAnimation.onComplete.add(() => {
    // Assume some time is needed before considering the action as completed,
    // such as waiting for the Chao to stop moving after being kicked.
    context.time.events.add(Phaser.Timer.SECOND * 4, () => {
        this.isBeingPushed = false;
        this.sprite.animations.play('cryingPose'); // This might already exist or be your desired follow-up action

        // Reset kick active state, cursor, and remove the 'active' class from the button
        window.kickActive = false;
        document.body.style.cursor = "url('assets/images/cursor2.png'), auto";
        var kickButton = document.getElementById('btnTwo'); // Adjust ID as necessary
        kickButton.classList.remove('active'); // Remove 'active' class
        
        console.log("Kicking action completed, kick active reset.");
    });
}, this);


var cryingPose = this.sprite.animations.add(
  'cryingPose', 
  Phaser.Animation.generateFrameNames('chao_', 14, 15, '', 3),
  this.speed * .07,
  true, // Set loop to true
  false
);

layingDown.onComplete.add(() => {
  context.time.events.add(Phaser.Timer.SECOND * 4, () => {
    this.isBeingPushed = false;
    console.log("pushed = false");
    this.sprite.animations.play('cryingPose');
  });
});


this.sprite.animations.add(
  'walkRight',
  [5, 15, 6, 15], 
  this.speed * .14,
  true
);
this.sprite.animations.add(
  'walkUp', 
  Phaser.Animation.generateFrameNames('chao_', 4, 5, '', 3),
  this.speed * .14,
  true,
  false
);
this.sprite.animations.add(
  'happy', 
  [31, 32, 31],
  2,
  false
);
this.sprite.animations.add(
  'grumpy', 
  Phaser.Animation.generateFrameNames('chao_', 7, 9, '', 3),
  3,
  true,
  false
);

this.sprite.animations.add(
  'pet',
  Phaser.Animation.generateFrameNames('chao_', 20, 22, '', 3),
  this.speed * .14,
  false,
  false
)

this.sprite.animations.add(
  'trumpet',
  Phaser.Animation.generateFrameNames('chao_', 18, 19, '', 3),
  2,
  false, // Ensure this is false to prevent looping
  false
);


var petAnimation = this.sprite.animations.getAnimation('pet');
petAnimation.onComplete.add(() => {
  this.sprite.animations.play('happy'); // Replace 'happy' with your default idle animation
  window.petActive = false;
  document.body.style.cursor = "url('assets/images/cursor2.png'), auto";
  var petButton = document.getElementById('btnOne'); // Adjust ID as necessary
  petButton.classList.remove('active'); // Remove 'active' class
  console.log("Petting action completed, pet active reset.");
  
}, this);

// this.sprite.animations.play(this.mood);
var repeatAnimation = function(animationName, times) {
  var count = 0; // Initialize count

  // Define a function to play the animation and increment the count
  var playAnimation = function() {
    if (count < times) {
      self.sprite.animations.play(animationName).onComplete.addOnce(function() {
        count++;
        playAnimation(); // Play the animation again
      });
    } else {
      self.sprite.animations.stop(); 
      // Optionally, do something after the last repetition
      console.log(animationName + " animation repeated " + times + " times.");
    }
  };

  // Start the first animation play
  playAnimation();
};


// prototypal
this.update = function(){
  
  self.health -= 4;
  
  // should i look for food?
  // if(self.health < 50 && (!self.tween || !self.tween.isRunning))
  //   self.hunt();

  // Stop moving if an item is consumed
  if (self.desire.target && !self.desire.target.sprite.visible) {
    self.sprite.animations.stop();
    repeatAnimation('happy', 2);   
    self.desire.target = null; // Clear the target
    return;
  }
  
  // obsessive chasing of aquired target.
  if(self.tween && self.tween.isRunning && self.desire.target){
    if(Phaser.Math.distance(
      self.tween.properties.x, 
      self.tween.properties.y, 
      self.desire.target.sprite.position.x,
      self.desire.target.sprite.position.y
    ) > 7){
      self.want(self.desire);
    }
  }

  // has something changed?
  if(self.desire.id != sequence){
    sequence = self.desire.id;
    console.log("desire changed!");
    
    if(self.desire.target){
      self.move({
        isImmediate: true,
        position: self.desire.target.getPosition(),
        time: (W.distance(self, self.desire.target) / self.speed) * 1000,
        callback: self.desire.target.use &&
          self.desire.target.use.bind(self) || null
      });
    }
  }
  
  // temp: then idle. let me know something
  // if(self.desire.isAppeased())
  //   console.log(self.health);
};

this.animate = function(){
  if (!self.isAnimating) { 
  if(W.isMoving(this)  &&  !this.isBeingPushed){
    
    var facing = W.getFacingDirection(this);
    switch(facing){
      case DIRECTION.UP: this.sprite.animations.play("walkUp"); break;
      case DIRECTION.DOWN: this.sprite.animations.play("walkDown"); break;
      case DIRECTION.LEFT: this.sprite.animations.play("walkRight"); this.sprite.scale.x = -1; break;
      case DIRECTION.RIGHT: this.sprite.animations.play("walkRight"); this.sprite.scale.x = 1; break;
    }
  }else{
    // this.sprite.animations.play(this.mood);
  }
  }
};

// this.sprite.animations.play("layingDown");

this.want = function(newDesire){
  var oldVersion = self.desire.id;
  self.desire = newDesire;
  newDesire.id = oldVersion+1;
  newDesire.isAppeased = newDesire.appeaseCondition;
};

// this.moveToPoint = function(x, y) {
//   // Stop any existing movement tween
//   if (this.tween) {
//       this.tween.stop();
//   }

//   var distance = Phaser.Math.distance(this.sprite.x, this.sprite.y, x, y);
//   var duration = (distance / this.speed) * 1000; // Calculate duration based on distance and speed

//   // Create a new tween for moving to the point
//   this.tween = context.add.tween(this.sprite).to({
//       x: x,
//       y: y
//   }, duration, Phaser.Easing.Linear.None, true);

//   // Listen for the completion of the tween animation
//   this.tween.onComplete.addOnce(function() {
//       // Stop all animations when movement is complete
//         // Stop the walking animation if it's playing
//       this.sprite.animations.stop('walkDown');
//       this.sprite.animations.stop('walkUp');
//       this.sprite.animations.stop('walkRight');
//       this.sprite.animations.stop();
//   }, this);
// };

this.move = function(options) {
  // Stop any existing movement tween
  if (this.tween) {
      this.tween.stop();
  }

  // Reuse the tween object if available, otherwise create a new one
  if (!this.tween || options.isImmediate) {
      this.tween = context.add.tween(this.sprite);
  }

  // Configure the tween with provided options
  this.tween.to(
      options.position,
      options.time,
      options.mode || Phaser.Easing.Linear.None,
      true
  );

  // Listen for the completion callback if provided
  if (options.callback) {
      this.tween.onComplete.add(options.callback);
  }
};

// prototypal

this.hunt = function(){
  
  var lunch = context.findNearest('IConsumable', 'isConsumable', self);
  
  if(lunch)
    self.want({target: lunch, appeaseCondition: function(){
      return self.health > 50;
    }});
  
};

return this;
}

// todo: remove default effect. accept options with overidding effect
function Item(name, x, y){
var self = this;
this.name = name;
this.effect = function(target){
  if(target.health)
    target.health += 30;
};

this.use = function() {
  // todo: only use if the this.position is close enough to use. otherwise ignore
  if(W.distance(this, self) <= 5){
      self.sprite.visible = false;
      self.effect(this);
      // Trigger the happy animation of the Chao
      self.sprite.animations.play('happy');
      return true;
  }else{
      this.mood = 'grumpy';
      return false;
  }
};

this.sprite = game.add.sprite(x, y, 'pet', name);
this.sprite.anchor.setTo(.5);
this.sprite.inputEnabled = true;
this.sprite.input.enableDrag();

this.isConsumable = function(){
  return self.sprite.visible;
};

this.getPosition = function(){
  return {x: self.sprite.position.x, y: self.sprite.position.y};
};

return this;
}

var GameState = {

init: function() {
  cheat = this;
  this.game.renderer.renderSession.roundPixels = true;
  this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  this.scale.pageAlignHorizontally = true;
  this.scale.pageAlignVertically = true;
},

preload: function() {
  this.game.load.atlasJSONHash('pet', 'assets/images/pet1.png', 'assets/data/pet.json');
},

create: function() {
  var self = this;
  
  this.background = this.game.add.sprite(0, 0, 'pet', 'garden');

  this.pet = new Chao({
    context: this,
    mood: 'happy'
  });

  this.IConsumables = [
    new Item('orange', 20, 25),
    new Item('apple', 85, 15),
    new Item('blueberry', 11, 100),
    new Item('plum', 125, 148),
  ];

   // Add event listeners to each consumable item sprite
   this.IConsumables.forEach(function(item) {
    item.sprite.events.onInputDown.add(function() {
        self.pet.want({ target: item, appeaseCondition: function() { return self.health > 50; } });
    }, self);
});

  this.trumpet = new Item('trumpet', 160, 60);
 
  this.trumpet.sprite.events.onInputDown.add(function() {
    var moveToTrumpet = self.game.add.tween(self.pet.sprite).to({ x: self.trumpet.sprite.x, y: self.trumpet.sprite.y - 10 }, 1000, Phaser.Easing.Linear.None, true);

    moveToTrumpet.onComplete.add(function() {
      // Hide the trumpet sprite only when the Chao has arrived
      self.trumpet.sprite.visible = false;

      self.pet.sprite.animations.play('trumpet');
      self.pet.isAnimating = true; // Flag to indicate the trumpet animation is playing

      // After 4 seconds (the duration of the trumpet animation)
      self.game.time.events.add(Phaser.Timer.SECOND * 4, function() {
        self.pet.sprite.animations.stop('trumpet'); // Stop the trumpet animation
        self.pet.isAnimating = false; // Reset the animation flag
        self.pet.sprite.animations.play('happy'); // Optionally play another animation, like 'happy'

        // Make the trumpet sprite visible again
        self.trumpet.sprite.visible = true;
      }, self);
    });
  }, this);

  // this.game.input.onTap.add(function(pointer) {
  //     var targetX = pointer.worldX;
  //     var targetY = pointer.worldY;

  //     // Call the modified move function with the target coordinates
  //     this.pet.moveToPoint(targetX, targetY);
  // }, this);



  this.duck = this.game.add.sprite(55, 136, 'pet', 'duck');
  this.duck.anchor.setTo(.5);
  this.duck.inputEnabled = true;
  
  // note: contains array of IUpdateable
  this.updateables = {
    everyFrame: [],
    timedFrame: [],
    add: function(obj, delay){
      
      if(obj.update) {
        
        if(delay || obj.frequency)
          this.timedFrame.push({
            name: obj.name,
            type: 'todo',
            loop: self.game.time.events.loop(delay || obj.frequency, obj.update)
          });
        else
          this.everyFrame.push(obj);
   
      }else{
        console.warn("Tried to add a game object that does NOT honor IUpdateable! name of object: "+obj.name);
      }
    },
    frequency: 60,
    update: function(){
      this.everyFrame.forEach(function(u){
        u.update();
      });
    }
  };
  
  this.updateables.add(this.pet, Phaser.Timer.SECOND * 1);
},

update: function(){
  this.updateables.update();
  this.pet.animate();
  var randomNumber = Math.floor(Math.random() * 1000);

  // if (randomNumber < 5) {
  //   this.pet.moveRandomly();
  // }
},

//generic version
findNearest: function(IInterface, isValidFunc, ISprite){
  return this[IInterface+'s'].sort(function(a, b){
    if(W.distance(a, ISprite) > W.distance(b, ISprite))
      return 1;
    else
      return -1;
    
  }).find(function(i){
    return i[isValidFunc]();
  }) 
  || null;
}
};

document.body.style.cursor = "url('assets/images/cursor2.png'), auto";
document.addEventListener('DOMContentLoaded', function() {
  var buttons = document.querySelectorAll('.gameButton');
  buttons.forEach(function(button) {
      button.addEventListener('click', function() {
          // Check if the clicked button is already active
          var isActive = button.classList.contains('active');

          // Remove 'active' class from all buttons
          buttons.forEach(function(btn) {
              btn.classList.remove('active');
          });


          // Reference to the feedMenu
          var feedMenu = document.getElementById('feedMenu');

          // Assuming no button is active initially
          window.petActive = false;
          window.kickActive = false;
          window.feedActive = false;
          feedMenu.style.display = 'none'; // Hide the feedMenu by default
          document.body.style.cursor = "url('assets/images/cursor2.png'), auto"; // Reset cursor

          // If the clicked button was not previously active, set it to active and change state
          if (!isActive) {
              button.classList.add('active'); // Add 'active' class to clicked button

              switch(button.id) {
                  case 'btnOne':
                      window.petActive = true;
                      document.body.style.cursor = "url('assets/images/cursor3.png'), auto";
                      console.log("pet active");
                      break;
                  case 'btnTwo':
                      window.kickActive = true;
                      document.body.style.cursor = "url('assets/images/cursor4.png'), auto";
                      break;
                  case 'btnThree':
                      window.feedActive = true;
                      feedMenu.style.display = 'flex'; // Display the feedMenu for the Feed button
                      break;
              }
          }
      });
  });
});



var game = new Phaser.Game(176, 160, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');

function positionGameMenu() {
  var gameCanvas = document.querySelector("canvas");
  if (!gameCanvas) return;

  var gameMenu = document.getElementById("gameMenu");
  if (!gameMenu) return;

  var canvasRect = gameCanvas.getBoundingClientRect();

  // Position the menu at the bottom right of the Phaser canvas
  gameMenu.style.bottom = (window.innerHeight - canvasRect.bottom + 100) + "px";
  gameMenu.style.right = (window.innerWidth - canvasRect.right) + "px";
}

var toggleImage = document.getElementById("toggleImage");
var feedMenu = document.getElementById("feedMenu");

toggleImage.onclick = function() {
    feedMenu.style.display = "none";
    document.body.style.cursor = "url('assets/images/cursor2.png'), auto";
    var feedButton = document.getElementById('btnThree'); // Adjust ID as necessary
    feedButton.classList.remove('active'); // Remove 'active' class
    window.petActive = false;
    window.kickActive = false;
    window.feedActive = false;
};


// Get the feedMenu div
var feedMenu = document.getElementById("feedMenu");

// Define an array of fruit names
var fruitNames = ["Passion Fruit", "Square Fruit", "Blueberry", "Triangle Fruit", "Mango", "Watermelon", "Pineapple"];

// Add images and fruit names to the feedMenu div
for (var i = 1; i <= 7; i++) {
    // Create a container div for each image and its corresponding text
    var containerDiv = document.createElement("div");
    containerDiv.style.display = "inline-flex"; // Make container div inline

    // Create an image element
    var img = document.createElement("img");

    // Set the source attribute to the path of the image
    img.src = "assets/images/food" + i + ".png";

    // Set styles for the image
    img.style.width = "7vh";
    img.style.height = "7vh";
    img.style.border = "2px solid white";
    img.style.marginLeft = "20vh"; // Adjust as needed
    img.style.borderRadius = '2vh';

    // Append the image to the container div
    containerDiv.appendChild(img);

    // Create a span element for the fruit name
    var span = document.createElement("span");

    // Set the text content for the span using the fruitNames array
    span.textContent = fruitNames[i - 1];

    // Set styles for the span
    span.style.marginLeft = "5vh"; // Adjust as needed
    span.style.marginTop = "2vh";
    span.style.fontSize = "4vh"; // Adjust as needed
    span.style.fontWeight = "500"; // Adjust as needed

    // Append the span to the container div
    containerDiv.appendChild(span);

    // Append the container div to the feedMenu div
    feedMenu.appendChild(containerDiv);
}


// Wait for the full page to load
window.addEventListener('load', function() {
  // Use setTimeout to delay the positioning slightly
  setTimeout(positionGameMenu, 300); // 100 milliseconds delay
});

window.addEventListener('resize', positionGameMenu);

