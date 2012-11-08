from django.db import models

class Marker(models.Model):
  title = models.CharField(max_length=60)
  lat = models.FloatField()
  lng = models.FloatField()
