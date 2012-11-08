from django.db import models

class Marker(models.Model):
  title = models.CharField()
  lat = models.FloatField()
  lng = models.FloatField()
