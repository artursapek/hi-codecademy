from django.http import HttpResponse
from django.shortcuts import render_to_response as render
from django.conf import settings
from django.views.static import serve
from utils import JSON
from django.template import RequestContext
import os
from src.models import *

def index(request):
  return render('index.html', { 'markers': Marker.objects.all()}, context_instance=RequestContext(request))

def tileimg(request, coords):
  print settings.ABS
  if os.path.exists('%s/%s.png' % (os.path.join(settings.ABS, 'assets', 'img', 'tiles'), coords)):
    return HttpResponse('%s.png' % coords)
  else:
    return HttpResponse('')

def addmarker(request):
  post = request.POST
  lat = post.get('lat')
  lng = post.get('lng')
  title = post.get('title', '')

  marker = Marker(title=title, lat=lat, lng=lng)
  print marker
  marker.save()
  return JSON(marker.jsonify())
