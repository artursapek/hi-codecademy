from PIL import Image
import math

# Boom
def split_image(tilesize):

  zoomLevel = {100: 1, 200: 2, 400: 3}[tilesize]

  image = Image.open('assets/map.%s.png' % zoomLevel)
  width, height = image.size

  cols = int(math.ceil(float(width) / tilesize))
  rows = int(math.ceil(float(height) / tilesize))

  halfX = cols / 2
  Xrange = range((-1 * halfX), halfX)

  halfY = rows / 2
  Yrange = range((-1 * halfY), halfY)

  print Xrange, Yrange

  for x in Xrange:
    for y in Yrange:
      addX = (halfX + x) * tilesize
      addY = (halfX + y) * tilesize

      print (
        addX,
        height - addY,
        addX + tilesize,
        height - addY + tilesize)

      cropped = image.crop((
        addX,
        height - addY - tilesize,
        addX + tilesize,
        height - addY))
      cropped.save('assets/img/tiles/%s.%s.%s.png' % (x, y, zoomLevel))

split_image(100)
split_image(200)
split_image(400)
