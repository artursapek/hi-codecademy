/* 
  Source for Artur maps
  Depends on jQuery

  Keeps track of lat/lng being viewed,
  handles dragging on map, tile size changes when zooming,
  and loading new tiles that come into the viewport.
 */

(function(){
  // Load the map at the origin (0, 0) by default
  var lat = 0, lng = 0,
      // Check for localStored coords last browsed to
      storedLat = localStorage.getItem('artur-maps-lat'),
      storedLng  = localStorage.getItem('artur-maps-lng'),

      // Zoom level: 1, 2, or 3 smallest to largest
      // Always start at 1 by default.
      zoomLevel = 1;
  
      console.log(storedLat, storedLng);
  // Apply stored coords if they've been stored
  storedLat && (lat = parseFloat(storedLat));
  storedLng && (lng = parseFloat(storedLng));


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
      lat -= (changeY / size);
      lng -= (changeX / size);

    };
      
    $('body').on('mousedown.draghandler', function(e){
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
          
          changeX = parseInt(changeX * 0.95, 10);
          changeY = parseInt(changeY * 0.95, 10);

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


  function getCoord($tile, coord){ return parseInt($tile.attr('data-' + coord), 10); }


  function updateTileImage ($tile){
    var x = getCoord($tile, 'x'), y = getCoord($tile, 'y'),
        url = '/assets/img/tiles/' + x + '.' + y + '.' + zoomLevel + '.png';
        $desiredRes = $tile.find('img[src="' + url + '"]'),
        $imgs = $tile.find('img');

    if ($desiredRes.length){
      // Picture has already been loaded, so put it on top and fade it in
      $desiredRes.appendTo($tile).fadeIn(250);

      setTimeout(function(){
        $tile.find('img').not('[src="' + url + '"]').fadeOut(250);
      }, 250);

    } else {
      $.get('/tile/' + x + '.' + y + '.' + zoomLevel, {}, function(response){
        /* Commit that we've loaded this tile so we don't load it again. */
        tilesLoaded.push(x + '.' + y);

        if (response == ''){
          // Don't use a background image if it doesn't exist - don't even create the tile
          $tile.remove();

        } else {
          /* If it does, load it and apply it as a background-image. */
          var img = new Image();

          /* 
            If the tile has no parent, it's not in the DOM yet. So prepend it.
            This prevents the program from re-prepending tiles when it reloads their images.
          */
          if (!$tile.parent().length){
            $mapcanvas.prepend($tile);
          }

          /* When we get the image, fade the tile in. */
          img.onload = function(){
            $tile.append(img).fadeIn(250);
            $(img).fadeIn(250).attr('zlevel', zoomLevel);

            setTimeout(function(){
              $tile.find('img').not('[src="' + url + '"]').fadeOut(250);
            }, 250);
          };

          /* Load it! */
          img.src = url;

        }
      });
    }
  }

  function makeTile(x, y){
    x = Math.ceil(x); y = Math.ceil(y);
    if (tilesLoaded.indexOf(x + '.' + y) > -1) return;      

    // Make DOM element for tile
    var $tile = $('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>');

    // Make tile appropriate size
    setTile($tile);

  };

  function setTile($tile){
    var size = [100, 200, 400][zoomLevel - 1],
        x = getCoord($tile, 'x'), y = getCoord($tile, 'y');

    updateTileImage($tile);

    $tile.css({
      width: size,
      height: size,
      left: (size * x) + 'px',
      bottom: (size * y) - size + 'px'
    });
  };

  function loadVisibleTiles(){
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
    localStorage.setItem('artur-maps-lat', lat);
    localStorage.setItem('artur-maps-lng', lng);
  };

  function setMarkers(){
    var size = [100, 200, 400][zoomLevel - 1];
    $('div.marker').each(function(){
      var $this = $(this);
      $this.css({
        left: parseFloat($this.attr('data-lng')) * size + 'px',
        bottom: parseFloat($this.attr('data-lat')) * size + 'px',
      })
    });
  };

  function changeZoom(){
    setMarkers();
    $mapcanvas.css({ '-webkit-transform': '' });
    $('.map-tile').each(function(){
      setTile($(this), false);
    });
    // Now that the viewport has changed, load any new tiles we need.
    loadVisibleTiles();
  }

  function parseCSS(){

  };

  $(document).ready(function(){
    
    /* Define previously declared variables to avoid repeated jQuery object creation */
    $mapcanvas = $('#map-canvas');
    $zoominButton = $('button#zoom-in');
    $zoomoutButton = $('button#zoom-out');

    /* Don't start drag and drop when using the buttons */
    $('button').on('mousedown mousemove', function(e){
      e.stopPropagation();
    })

    /* Center the canvas on last location/default location */
    $mapcanvas.css({
      /*
        parseInt to make sure they are not floating point
        which would later cause tiny hairlines to show up between tiles
        when using -webkit-transform: scale().
      */
      left: parseInt((window.innerWidth / 2) , 10) + (lng * 100) + 'px',
      top: parseInt((window.innerHeight / 2), 10) + (lat * 100) + 'px'
    });

    /*
      Button event handlers
     */
    $('#controls-zoom button').click(function(){
      var $this = $(this), zoomin = (this.id == 'zoom-in');
      
      /* If we've maxed out, don't do anything. */
      if ((zoomin && zoomLevel == 3) || (!zoomin && zoomLevel == 1)) return;
      
      $mapcanvas.css({
        '-webkit-transform': zoomin ? 'scale(2)' : 'scale(0.5)',
        left: parseCSS($mapcanvas, 'left', function(x){ return (zoomin ? x / 2 : x * 2); }),
        top: parseCSS($mapcanvas, 'top', function(x){ return (zoomin ? x / 2 : x * 2); }),
      });

      zoomLevel += (zoomin ? 1 : -1);

      // Update sprites
      if (zoomin){
        $zoomoutButton.attr('class', 'sprite');
        $zoominButton.attr('class', (zoomLevel == 3) ? 'disabled' : 'sprite');
      } else {
        $zoominButton.attr('class', 'sprite');
        $zoomoutButton.attr('class', (zoomLevel == 1) ? 'disabled' : 'sprite');
      }

      setTimeout(changeZoom, 10);
    });

    /* Initialize dat map */
    loadVisibleTiles();
    setMarkers();

    /* Attach drag listeners */
    handleDrag($mapcanvas);
  });
}());
