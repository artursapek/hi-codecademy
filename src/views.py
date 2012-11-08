from django.http import HttpResponse
from django.shortcuts import render_to_response as render
from utils import JSON

def index(request):
  return render('index.html')
