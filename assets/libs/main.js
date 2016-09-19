$(function() {

  // ---------------------------------------------------------------------------
  // Drawing Board
  // ---------------------------------------------------------------------------
  var Drawing = {

    context: null,
    $el: null,
    paint: null,

    oldX: null,
    oldY: null,
    offsetLeft: null,
    offsetTop: null,

    size: 5,
    color: '#111111',
    erasing: false,

    initialize: function() {

      this.$el = $('#canvas');
      this.context = document.getElementById('canvas').getContext("2d");
      this.context.fillStyle = "white";
      this.context.fillRect(0, 0, this.$el.get(0).width, this.$el.get(0).height);

      this.offsetLeft = this.$el.get(0).offsetLeft;
      this.offsetTop = this.$el.get(0).offsetTop;

      return this.initEvents();
    },

    initEvents: function() {

      var that = this;

      this.$el.mousedown(function(e) {

        that.oldX = e.pageX - that.offsetLeft;
        that.oldY = e.pageY - that.offsetTop;
        that.paint = true;
        return that.draw(e, false);
      });

      this.$el.mouseenter(function() { $('body').addClass('custom-cursor'); });
      this.$el.mouseleave(function() { $('body').removeClass('custom-cursor'); });

      this.$el.mousemove(function(e) {

        that.handleCursor(e);
        if (!that.paint) return true;
        return that.draw(e, false, true);
      });

      this.$el.mouseup(function() {

        that.paint = false;
        return that;
      });

      return this;
    },

    draw: function(e, dist, drag) {

      var currentX = dist.currentX || e.pageX - this.offsetLeft;
      var currentY = dist.currentY || e.pageY - this.offsetTop;

      if (currentX === this.oldX && !drag) currentX += 1;
      if (currentY === this.oldY && !drag) currentY += 1;

      if (!dist) this.emitDraw(currentX, currentY);

      this.context.strokeStyle =  dist.color || this.erasing || this.color;

      this.context.lineJoin = "round";
      this.context.lineWidth = dist.size || this.size;
      this.context.beginPath();
      this.context.moveTo(dist.oldX || this.oldX, dist.oldY || this.oldY);
      this.context.lineTo(currentX, currentY);
      this.context.closePath();
      this.context.stroke();

      this.oldX = currentX;
      this.oldY = currentY;
      return this;
    },

    emitDraw: function(x, y) {

      return Socket.emit('draw', {
        currentX: x,
        currentY: y,
        oldX: this.oldX,
        oldY: this.oldY,
        size: this.size,
        color: this.erasing || this.color,
        mode: this.mode
      });

    },

    handleCursor: function(e) {

      $('#cursor').css({
        left: e.pageX - this.size / 2,
        top: e.pageY - this.size / 2,
        width: this.size,
        height: this.size,
      });

    },

    fetchContext: function(id) {

      var img = this.context.canvas.toDataURL("image/png", 1.0);
      Socket.emit('context:fetched', {id: id, img: img});
      return this;
    },

    initContext: function(src) {

      var that = this;
      var img = new Image;

      img.onload = function() {

        that.context.drawImage(img,0,0);
      };

      img.src = src;

      return this;
    },

  }

  // ---------------------------------------------------------------------------
  // ToolBar
  // ---------------------------------------------------------------------------
  var Tools = {

    $el: $('#toolbar'),

    initialize: function() {

      var that = this;

      this.$el.find('.preview').click(function () {

        $(this).parent().addClass('open');
      });

      this.$el.find('.dropdown.size li').click(this.setSize.bind(this));
      this.$el.find('.dropdown.color li').click(this.setColor.bind(this));
      this.$el.find('.dropdown.set-mode').click(this.setMode.bind(this));

    },

    closeDropdown: function(e) {

      this.$el.find('.dropdown').removeClass('open');
      return this;
    },

    setMode: function(e) {

      var that = this;
      var mode = $(e.currentTarget).data('mode');
      Drawing.erasing = mode;

      this.$el.find('.dropdown').removeClass('activ');
      this.$el.find(e.currentTarget).addClass('activ');
      return that;
    },

    setSize: function(e) {

      var that = this;
      var size = $(e.currentTarget).data('size');

      this.$el.find('.size .preview').attr('data-size', size);

      Drawing.size = size;
      return this.closeDropdown();
    },

    setColor: function(e) {

      var that = this;
      var color = $(e.currentTarget).data('color');

      this.$el.find('.color .preview').attr('data-color', color);

      Drawing.color = color;
      return this.closeDropdown();
    },

  }

  // ---------------------------------------------------------------------------
  // Socket
  // ---------------------------------------------------------------------------
  var Socket = {

    socket: null,

    initialize: function() {

      var that = this;

      this.socket = io();

      this.socket.on('context:fetch', Drawing.fetchContext.bind(Drawing));
      this.socket.on('context:init', Drawing.initContext.bind(Drawing));
      this.socket.on('draw', function(data) {

        return Drawing.draw(false, data);
      });
      this.socket.on('connect', function() {

        return that.emit('initialize');
      });

      return [
        Drawing.initialize(),
        Tools.initialize(),
      ]
    },

    emit: function(ev, data) {

      this.socket.emit(ev, data);
    },
  }



  return Socket.initialize();
});
