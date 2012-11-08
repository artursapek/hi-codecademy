from django.utils import simplejson
from django.http import HttpResponse

# JSON : Helper for AJAX call responses.
#        Jsonifies python dict of data and returns it
# dict => HttpResponse(JSON)
def JSON(response_dict):
    return HttpResponse(simplejson.dumps(response_dict, separators=(',',':')), mimetype='application/javascript')
