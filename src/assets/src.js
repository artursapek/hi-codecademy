(function(){
  // Load at the origin by default
  var lat = 0, lng = 0,
      // Check for localStored coords last browsed to
      storedLat = localStorage.getItem('saved-lat'),
      storedLng  = localStorage.getItem('saved-lng'),

      // Zoom level: 1, 2, or 3 smallest to largest
      zoomLevel = 2;
  
  // Apply stored coords if they've been stored
  storedLat && (lat = storedLat);
  storedLng && (lng = storedLng);


  var $mapcanvas, $zoominButton, $zoomoutButton, tilesLoaded = [];
  t = tilesLoaded;


  var handleDrag = function($this){
    var mdown = false, lastX = null, lastY = null, justmoved = false,
        changeX = 0, changeY = 0, inertiaInterval,

    move = function(){
      var size = [100, 200, 400][zoomLevel - 1];
      $this.animate({
        left: '-=' + changeX + 'px',
        top: '-=' + changeY + 'px'
      }, 0);
      lat += (changeX / size);
      lng -= (changeY / size);

    };
      
    $this.on('mousedown.draghandler', function(e){
      mdown = true;
      changeX = changeY = 0;
      // Prevent images from being dragged indiviually
      e.preventDefault();
    }).on('mousemove.draghandler', function(e){
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
    }).on('mouseup.draghandler', function(){
      mdown = false;
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
    var $tile = $('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>');

    // Make tile appropriate size
    setTile($tile);

    // Here, check if the tile has an image available.
    $.get('/tile/' + x + '.' + y, {}, function(url){
      // Commit that we've loaded this tile so we don't load it again.
      tilesLoaded.push(x + '.' + y);
      // If no file exists
      if (url == ''){
        // Don't use a background image
        $tile.fadeIn(250);
      } else {
        // If it does, load it and apply it as a background-image.
        url = '/assets/img/tiles/' + url;
        var img = new Image();
        img.onload = function(){
          $tile.append(img).fadeIn(250);
        };
        img.src = url;
      }
    });
    $mapcanvas.append($tile);
  };

  var setTile = function($tile, anim){
    var x = parseInt($tile.attr('data-x'), 10),
        y = parseInt($tile.attr('data-y'), 10),
        speed = anim == true ? 200 : 0,
        size = [100, 200, 400][zoomLevel - 1];

    x = parseInt(x, 10);
    y = parseInt(y, 10);

    $tile.animate({
      width: size,
      height: size,
      left: (size * x) + 'px',
      bottom: (size * y) - size + 'px'
    }, speed, 'easeOutQuad');
  };

  var loadVisibleTiles = function(){
    var scale = [200, 400, 800][zoomLevel - 1], spreadX = Math.ceil(window.innerWidth / scale) + 2, spreadY = Math.ceil(window.innerHeight / scale) + 2;
    for (var x = 0; x <= spreadX; ++ x){
      for (var y = 0; y <= spreadY; ++ y){
        // Do these checks for zero so we don't make two copies of tiles with zeros in them,
        // because the inverse of zero is zero.
        makeTile(lat + x, lng + y);
        if (x !== 0) $tl = makeTile(lat - x, lng + y);
        if (y !== 0) $br = makeTile(lat + x, lng - y);
        if (x !== 0 && y !== 0) $bl = makeTile(lat - x, lng - y);
      };
    };
  };

  var changeZoom = z = function(level){
    zoomLevel = level;
    $('.map-tile').each(function(){
      setTile($(this), false);
    });
    // Now that the viewport has changed, load any new tiles we need.
    loadVisibleTiles();
    $mapcanvas.css({ '-webkit-transform': '' });
  }
  

  $(document).ready(function(){
    
    // Define previously declared variables
    $mapcanvas = $('#map-canvas');
    $zoominButton = $('button#zoom-in');
    $zoomoutButton = $('button#zoom-out');

    // Drag and drop 
    var mdown = false;

    // Center the canvas on last location/default location
    $mapcanvas.css({
      left: (window.innerWidth / 2) + (lat * 200) + 'px',
      top: (window.innerHeight / 2) + (lng * 200) + 'px'
    });

    // Initialize dat map
    loadVisibleTiles();
    handleDrag($mapcanvas);


    // Initialize buttons
    $zoomoutButton.click(function(){
      if (zoomLevel == 1) return;

      $mapcanvas.css({ '-webkit-transform': 'scale(0.5)' });
      zoomLevel --;
      setTimeout(function(){
        changeZoom(zoomLevel);
      }, 1);
    });
    $zoominButton.click(function(){
      if (zoomLevel == 3) return;
      $mapcanvas.css({ '-webkit-transform': 'scale(2.0)' });
      zoomLevel ++;
      setTimeout(function(){
        changeZoom(zoomLevel);
      }, 1);
    });
  });
}());
