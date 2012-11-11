/* 
  Source for Artur maps
  Depends on jQuery

  Keeps track of lat/lng being viewed,
  handles dragging on map, tile size changes when zooming,
  and loading new tiles that come into the viewport.
 */

(function(){
  /* Load the map at the origin (0, 0) by default */
  var lat = 0, lng = 0, size = 100,
      /*
        Zoom level: 1, 2, or 3 smallest to largest
        Always start at 1 by default.
      */
      zoomLevel = 1;
  
  /* Some jQuery objects we're creating on doc ready, but want to be able to reference in these helpers */
  var $mapcanvas, $zoominButton, $zoomoutButton, tilesLoaded = [];


  /* Helper functions: */

  /*
    Gets bound to $mapcanvas on doc ready
    Adds all dragging/inertia functionality
  */
  var handleDrag = function($this){
    var mdown = false, lastX = null, lastY = null, justmoved = false,
        changeX = 0, changeY = 0, inertiaInterval,

    move = function(){
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
        /* Update the amts. to move and save current position for comparison on next event firing */
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
      $desiredRes.appendTo($tile).show();

      setTimeout(function(){
        $tile.find('img').not('[src="' + url + '"]').hide();
      }, 250);

    } else {
      $.get('/tile/' + x + '.' + y + '.' + zoomLevel, {}, function(response){
        /* Commit that we've loaded this tile so we don't load it again. */
        tilesLoaded.push(x + '.' + y + '.' + zoomLevel);

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
            $tile.append(img).show();
            $(img).show().attr('zlevel', zoomLevel);

            setTimeout(function(){
              $tile.find('img').not('[src="' + url + '"]').hide();
            }, 250);
          };

          /* Load it! */
          img.src = url;
        }
      });
    }
  }

  function droppableMarker(){
    var $draggable = $('<div class="marker"><div class="marker-graphic"></div></div>'),
        $body = $('body');
    $draggable.appendTo($body);
    $body.on('mousemove.markerdrag', function(e){
      $draggable.css({
        left: e.clientX,
        top: e.clientY - 16
      });
    }).one('click', function(e){
      var offset = $mapcanvas.offset(),
          x = (offset.left - e.clientX) - 60,
          y = (offset.top - e.clientY);
      makeMarker(x / size, y / size);
      /* timeout this so there's no flicker when the permanent marker gets put down */
      setTimeout(function(){
        $draggable.remove();
      }, 10);
    });
  };

  function makeMarker(x, y){
    $.ajax({
      type: 'POST',
      url: '/add-marker/',
      data: {
        lat: y,
        lng: x,
        csrfmiddlewaretoken: csrftoken
      },
      complete: function(data){
        data = JSON.parse(data.responseText);
        var $marker = $('<div class="marker" lat="'+data.lat+'" lng="'+data.lng+'"><div class="marker-graphic"></div><div class="marker-shadow"></div></div>');
        $('#markers').append($marker)
        setMarkers();
        $marker.animate({ bottom: '+=16px' }, 0).animate({bottom: '-=16px'}, 300, 'easeOutQuad');
      }
    });
  };

  function makeTile(x, y){
    x = Math.ceil(x); y = Math.ceil(y);
    if (tilesLoaded.indexOf(x + '.' + y + '.' + zoomLevel) > -1) return;      
    /* Make DOM element for tile */
    var $tile = $('<div class="map-tile" data-x="' + x + '" data-y="' + y + '"></div>');
    /* Pass the tile in to get set up with its position and image */
    setTile($tile);
  };

  /* 
    Put a tile in its correct position
    Input a $(tile)
    No output
  */
  function setTile($tile){
    var x = getCoord($tile, 'x'), y = getCoord($tile, 'y'),
        rc = ['medium large', 'small large', 'medium large']
        ac = ['small', 'medium', 'large'];
    updateTileImage($tile);
    $tile.removeClass(rc[zoomLevel - 1]).addClass(ac[zoomLevel - 1]).css({
      left: (size * x) + 'px',
      bottom: (size * y) - size + 'px'
    });
  };

  /* 
    Load any new tiles which may have come into the viewport
    No input/output
  */
  function loadVisibleTiles(){
    var scale = [200, 400, 800][zoomLevel - 1], 
        latCeil = Math.ceil(lat), lngCeil = (Math.ceil(lng)) * -1,
        spreadX = Math.ceil(window.innerWidth / scale) + 4, spreadY = Math.ceil(window.innerHeight / scale) + 4;
    for (var x = lngCeil; x <= lngCeil + spreadX; ++ x){
      for (var y = latCeil; y <= lat + spreadY; ++ y){
        
        // Do these checks for zero so we don't make two copies of tiles with zeros in them,
        // because the inverse of zero is zero.
        makeTile(lat + x, lng + y);
        if (x !== 0) $tl = makeTile(lat - x, lng + y);
        if (y !== 0) $br = makeTile(lat + x, lng - y);
        if (x !== 0 && y !== 0) $bl = makeTile(lat - x, lng - y);
      };
    };
  };

  /*
    Reposition map markers to reflect current zoom level
    No input/output
  */
  function setMarkers(){
    $('div.marker').each(function(){
      var $this = $(this);
      $this.css({
        right: parseFloat($this.attr('lng')) * size + 'px',
        bottom: parseFloat($this.attr('lat')) * size + 'px',
      })
    });
  };

  /*
    Update markers and tiles to reflect current zoomLevel
    No input/output
  */
  function updateZoom(){
    size = [100, 200, 400][zoomLevel - 1];
    setMarkers();
    updateMapCenter();
    $mapcanvas.css({ '-webkit-transform': '' });
    // Now that the viewport has changed, load any new tiles we need.
    loadVisibleTiles();
    $('.map-tile').each(function(){
      setTile($(this), false);
    });
  }

  function updateMapCenter(){
    $mapcanvas.css({
      /*
        parseInt to make sure they are not floating point
        which would later cause tiny hairlines to show up between tiles
        when using -webkit-transform: scale().
      */
      left: parseInt((window.innerWidth / 2) , 10) + (lng * size) + 'px',
      top: parseInt((window.innerHeight / 2), 10) + (lat * size) + 'px'
    });
  }


  /* Temporarily fix the map offset while it's being pseudo-zoomed by -webkit-transform */
  function multiplyMapOffset(m){
    var offset = $mapcanvas.offset();
    $mapcanvas.css({
      left: offset.left * m + 'px',
      top: offset.top * m + 'px',
    });
  }

  $(document).ready(function(){
    
    /* Define previously declared variables to avoid repeated jQuery object creation */
    $mapcanvas = $('#map-canvas');
    $zoominButton = $('button#zoom-in');
    $zoomoutButton = $('button#zoom-out');
    $markerButton = $('button#make-marker');

    /* Don't start drag and drop when using the buttons */
    $('button').on('mousedown mousemove', function(e){
      e.stopPropagation();
    })

    /*
      Button event handlers
     */

    $markerButton.click(function(e){
      e.stopPropagation();
      droppableMarker()
    });

    $('#controls-zoom button').click(function(){
      var $this = $(this), zoomin = (this.id == 'zoom-in');
      
      /* If we've maxed out, don't do anything. */
      if ((zoomin && zoomLevel == 3) || (!zoomin && zoomLevel == 1)) return;

      /*
      $mapcanvas.css({
        '-webkit-transform': zoomin ? 'scale(2)' : 'scale(0.5)',
      });
      */

      zoomLevel += (zoomin ? 1 : -1);

      /* Update sprites */
      if (zoomin){
        $zoomoutButton.attr('class', 'sprite');
        $zoominButton.attr('class', (zoomLevel == 3) ? 'disabled' : 'sprite');
      } else {
        $zoominButton.attr('class', 'sprite');
        $zoomoutButton.attr('class', (zoomLevel == 1) ? 'disabled' : 'sprite');
      }
      /* Update map */
      setTimeout(updateZoom, 10);
    });

    /* Initialize dat map */
    updateMapCenter();
    loadVisibleTiles();
    setMarkers();

    /* Attach drag listeners */
    handleDrag($mapcanvas);
  });
}());
