/**
 * Created by Daniil on 25.03.2015.
 */
var Sprite = function (type, artist, behaviors) { // конструктор
    this.type = type || '';
    this.artist = artist || undefined;
    this.behaviors = behaviors || [];

    this.left = 0;
    this.top = 0; this.width = 10;  // Нечто отличное от нуля, что не имеет смысла
    this.height = 10;  // Нечто отличное от нуля, что не имеет смысла
    this.velocityX = 0;
    this.velocityY = 0;
    this.opacity = 1.0;
    this.visible = true;

    return this;
};

Sprite.prototype = { // Методы
    draw: function (context) {
        context.save();

        // Вызовы save() и restore() делают настройку globalAlpha временной

        context.globalAlpha = this.opacity;

        if (this.artist && this.visible) {
            this.artist.draw(this, context);
        }

        context.restore();
    },

    update: function (time, fps) {
        for (var i=0; i < this.behaviors.length; ++i) {
            if (this.behaviors[i] === undefined) { // Изменен во время цикла?
                return;
            }

            this.behaviors[i].execute(this, time, fps);
        }
    }
};

// ImageArtists создает растровое изображение

var ImageArtist = function (imageUrl) { // конструктор
    this.image = new Image();
    this.image.src = 'images/sprite_camel.png';
};

ImageArtist.prototype = { // Методы
    draw: function (sprite, context) {
        context.drawImage(this.image, sprite.left, sprite.top);
    }
};

// Начертатели на основе страницы спрайтов создают растровое изображение,
// взятое со страницы спрайтов

SpriteSheetArtist = function (spritesheet, cells) { // конструктор
    this.cells = cells;
    this.spritesheet = spritesheet;
    this.cellIndex = 0;
};

SpriteSheetArtist.prototype = { // Методы
    advance: function () {
        if (this.cellIndex == this.cells.length-1) {
            this.cellIndex = 0;
        }
        else {
            this.cellIndex++;
        }
    },

    draw: function (sprite, context) {
        var cell = this.cells[this.cellIndex];

        context.drawImage(this.spritesheet,
            cell.left,   cell.top,     // исходное значение x, исходное значение y
            cell.width,  cell.height,  // исходная ширина, исходная высота
            sprite.left, sprite.top,   // конечное значение x, конечное значение y
            cell.width,  cell.height); // конечная ширина, конечная высота
    }
};