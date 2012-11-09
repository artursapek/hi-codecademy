from django.http import HttpResponse
from django.shortcuts import render_to_response as render
from django.conf import settings
from django.views.static import serve
from utils import JSON
import os

def index(request):
  return render('index.html')

def tileimg(request, coords):
  print settings.ABS
  if os.path.exists('%s/%s.png' % (os.path.join(settings.ABS, 'assets', 'img', 'tiles'), coords)):
    return HttpResponse('%s.png' % coords)
  else:
    return HttpResponse('')

def addmarker(request):
  post = request.POST
  x = post.get('x')
  y = post.get('y')
  title = post.get('title')
  marker = Marker(title, x, y)
  marker.save()
