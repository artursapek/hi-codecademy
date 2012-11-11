from PIL import Image
import math
import os

'''
  split_image

  Splits assets/map.x.png into tiles, saves them to assets/img/tiles

  To split your own map, save it in resolutions where 
  x is 1, 2, and 3 where each is half the size of its successor

  For example, map.3.png might be an 8000 x 8000 image, while
  map.2.png would be 4000 x 4000 and map.1.png would be 2000 x 2000.

  Tiles are saved by the file name pattern x.y.r.png where
  x and y describe where on the map it is.
    EX: (0, 0) is the origin and (1, 0) is the tile to its right.
  r is its resolution, corresponding to 1, 2, or 3

  The map has different sized square tiles at different zoom levels. Currently:
    1 => 100px * 100px
    2 => 200px * 200px
    3 => 400px * 400px

  I/P: (tilesize: int) 100, 200, or 400
       (zoomlevel: int) 1, 2, or 3
  O/P: nothing
'''


''' 
  empty
  Given img.load() on a PIL Image, returns bool telling if it's 100% transparent pixels.
'''
def empty(img, ts):
  for x in xrange(ts):
    for y in xrange(ts):
      ''' As soon as we find a non-transparent pixel, say so and stop '''
      if img.getpixel((x, y))[3] != 0:
        return False
  return True

def split_image(tilesize, zoomlevel):

  ''' Load the image, get its dimensions '''
  image = Image.open('assets/map.%s.png' % zoomlevel)
  width, height = image.size

  ''' Determine how many rows/cols of tiles we will have based on the image size and zoom level '''
  cols = int(math.ceil(float(width) / tilesize))
  rows = int(math.ceil(float(height) / tilesize))

  ''' 
    Since we treat 0,0 as the center-most tile, split those numbers 
    in half and iterate out in both directions from the middle.
  '''
  halfX = cols / 2
  Xrange = range((-1 * halfX), halfX)

  halfY = rows / 2
  Yrange = range((-1 * halfY), halfY)

  for x in Xrange:
    for y in Yrange:
      ''' However much we're adding or subtracting from the middle (0, 0) tile in both directions '''
      addX = (halfX + x) * tilesize
      addY = (halfX + y) * tilesize

      ''' (leftbound, topbound, rightbound, bottombound) coords '''
      cropDimens = (
        addX,
        height - addY,
        addX + tilesize,
        height - addY + tilesize)


      ''' Crop and save it '''
      cropped = image.crop(cropDimens)
      cropped.convert('RGBA')
      
      ''' If it's empty, don't even save it '''
      if empty(cropped, tilesize):
        print 'Omitting empty tile (%s, %s)' % (x, y)
        continue

      ''' Otherwise, save and continue '''
      path = 'assets/img/tiles/%s.%s.%s.png' % (x, y, zoomlevel)
      print 'Saved %s' % path
      cropped.save(path)

''' Split the image on the sizes we decided on! '''

split_image(100, 1)
split_image(200, 2)
split_image(400, 3)
