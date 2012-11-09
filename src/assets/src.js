(function(){
  // Load at the origin by default
  var lat = 0, lng = 0,
      storedLat = localStorage.getItem('saved-lat'),
      storedLng  = localStorage.getItem('saved-lng');
  
  // Apply stored coords if they've been stored
  storedLat && (lat = storedLat);
  storedLng && (lng = storedLng);


  $(document).ready(function(){
  
    var $mapcanvas = $('#map-canvas');

    var makeTile = function(x, y){
      var $tile = $('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>').css({
        left: (200 * x) + 100 + 'px',
        bottom: (200 * y) - 100 + 'px'
      });
      // Don't show the tile until its background image has been loaded.
      // First check if a file is available
      $.get('/tile/' + x + '.' + y, {}, function(url){
        // If no file exists
        if (url == ''){
          // Don't use a background image
          $tile.css({ 'background-image': 'none' }).fadeIn(300);
        } else {
          // If it does, load it.
          url = '/assets/img/tiles/' + url;
          var img = new Image();
          img.onload = function(){
            $tile.css({ 'background-image': 'url(' + url + ')' }).fadeIn(300);
          };
          img.src = url;
        }
      });
      return $tile;
    };

    var loadVisibleTiles = function(){
      var spreadX = Math.ceil(window.innerWidth / 400), spreadY = Math.ceil(window.innerHeight / 400);
      for (var x = 0; x <= spreadX; ++ x){
        for (var y = 0; y <= spreadY; ++ y){
          var $tr = makeTile(lat + x, lng + y), $tl = makeTile(lat - x, lng + y),
              $br = makeTile(lat + x, lng - y), $bl = makeTile(lat - x, lng - y);
          $mapcanvas.append($tr, $tl, $br, $bl);
        };
      };
    };

    loadVisibleTiles();


  });
}());
