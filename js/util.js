const DIRECTION = {
    DOWN: 'Down',
    UP: 'Up',
    LEFT: 'Left',
    RIGHT: 'Right'
};

window.W = {
    
    randomInt: function(min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    },
    
    distance: function(a, b) {
        return Phaser.Math.distance(
            a.sprite.position.x,
            a.sprite.position.y,
            b.sprite.position.x,
            b.sprite.position.y
        );
    },
    getFacingDirection: function(obj){
        var dir = DIRECTION.DOWN;
        
        if(obj.sprite){
            
            var horizontalDiff = Math.abs(obj.sprite.position.x - obj.sprite.previousPosition.x);
            var verticalDiff = Math.abs(obj.sprite.position.y - obj.sprite.previousPosition.y);
            
            if(horizontalDiff > verticalDiff + 0.1)
                dir = obj.sprite.position.x > obj.sprite.previousPosition.x ? DIRECTION.RIGHT : DIRECTION.LEFT;
            else
                dir = obj.sprite.position.y > obj.sprite.previousPosition.y ? DIRECTION.DOWN : DIRECTION.UP;
            
        }else{
            console.warn(obj.name, "getFacingDirection failed because 'sprite' property is missing");
        }
        
        return dir;
    },
    isMoving: function(obj){
        if(obj.sprite)
            return obj.sprite.position.x !== obj.sprite.previousPosition.x
                || obj.sprite.position.y !== obj.sprite.previousPosition.y;
    }
};