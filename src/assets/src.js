(function(){
  /* Init map with coords */
  

  $(document).ready(function(){
    var map_tiles = $('.map-tile');
    map_tiles.each(function(){
      var $this = $(this),
          x = parseInt($this.attr('data-x'), 10),
          y = parseInt($this.attr('data-y'), 10);
      $this.css({
        left: (200 * x) + 'px',
        bottom: (200 * y) + 'px',
      });
      var img = new Image(), $img = $(img), src = '/assets/img/tiles/' + x + '.' + y + '.png';
      img.onerror = function(){
        $this.css({ 'background-image': 'none' }).fadeIn(500);
      };
      img.onload = function(){
        $this.css({ 'background-image': 'url(' + src + ')' }).fadeIn(500);
      };
      img.src = src;
    });


  });







}());
