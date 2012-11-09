(function(){
  // Load at the origin by default
  var lat = 0, lng = 0,
      storedLat = localStorage.getItem('saved-lat'),
      storedLng  = localStorage.getItem('saved-lng');
  
  // Apply stored coords if they've been stored
  storedLat && (lat = storedLat);
  storedLng && (lng = storedLng);


  var $mapcanvas, tilesLoaded = [];
  t = tilesLoaded;

  var handleDrag = function($this){
    var mdown = false, lastX = null, lastY = null, justmoved = false,
        changeX = 0, changeY = 0, inertiaInterval, move = function(){
      $this.animate({
        left: '-=' + changeX + 'px',
        top: '-=' + changeY + 'px'
      }, 0);
      lat += (changeX / 200);
      lng -= (changeY / 200);
    };
      
    $this.on('mousedown.drag', function(){
      mdown = true;
      changeX = changeY = 0;
    }).on('mousemove.drag', function(e){
      // Ignore when user isn't dragging.
      if (!mdown){
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      } else {
        changeX = lastX - e.clientX,
        changeY = lastY - e.clientY;

        move();

        lastX = e.clientX;
        lastY = e.clientY;

        justmoved = true;
        setTimeout(function(){
          justmoved = false;
          changeX = changeY = 0;
        }, 500);
      }
    }).on('mouseup.drag', function(){
      mdown = false;
      console.log('jm', justmoved);
      if (justmoved){
        inertiaInterval = setInterval(function(){
          
          changeX = changeX * 0.95;
          changeY = changeY * 0.95;

          move();

          if (changeX < 1 && changeY < 1){
            clearInterval(inertiaInterval);
            loadVisibleTiles();
          }
        }, 5);
      } else {
        loadVisibleTiles();
      }
    });
  };
    var makeTile = function(x, y){
      x = Math.ceil(x);
      y = Math.ceil(y);
      if (tilesLoaded.indexOf(x + '.' + y) > -1) return;      
      var $tile = $('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>').css({
        left: (200 * x) + 100 + 'px',
        bottom: (200 * y) - 100 + 'px'
      });
      // Don't show the tile until its background image has been loaded.
      // First check if a file is available
      $.get('/tile/' + x + '.' + y, {}, function(url){
        tilesLoaded.push(x + '.' + y);
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
      $mapcanvas.append($tile);
    };

    var loadVisibleTiles = function(){
      var spreadX = Math.ceil(window.innerWidth / 400), spreadY = Math.ceil(window.innerHeight / 400);
      for (var x = 0; x <= spreadX; ++ x){
        for (var y = 0; y <= spreadY; ++ y){
          makeTile(lat + x, lng + y);
          if (x !== 0) $tl = makeTile(lat - x, lng + y);
          if (y !== 0) $br = makeTile(lat + x, lng - y);
          if (x !== 0 && y !== 0) $bl = makeTile(lat - x, lng - y);
        };
      };
    };
    

  $(document).ready(function(){
  
    $mapcanvas = $('#map-canvas');

    // Drag and drop 

    var mdown = false;

    $mapcanvas.css({
      left: (window.innerWidth / 2) + (lat * 200) + 'px',
      top: (window.innerHeight / 2) + (lng * 200) + 'px'
    });

    // Initialize dat map
    loadVisibleTiles();
    handleDrag($mapcanvas);
  });
}());
