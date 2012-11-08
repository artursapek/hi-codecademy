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
    });


  });







}());
