from django.db import models

class Marker(models.Model):
  title = models.CharField(max_length=60)
  lat = models.FloatField()
  lng = models.FloatField()
  def jsonify(self):
    return {
             'title': self.title,
             'lat':   self.lat,
             'lng':   self.lng
           }
  def __unicode__(self):
    return '%s %s %s' % (self.lat, self.lng, self.title)
