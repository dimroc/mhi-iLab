import string, sys
import httplib, urllib

data = { "svg": """<svg width="100%" height="100%" version="1.1"
xmlns="http://www.w3.org/2000/svg">

<rect width="300" height="100"
style="fill:rgb(0,0,255);stroke-width:1;
stroke:rgb(0,0,0)"/>

</svg>"""};

body = urllib.urlencode(data)
headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/html"}

def dispatchToPdf():
    connection = httplib.HTTPConnection('localhost:3000')
    connection.request("POST", "/pdf", body, headers)
    response = connection.getresponse()
    data_returned = response.read()
    location = response.msg['location']

    print(response.status)
    print(data_returned)
    print('location: ' + location)
    connection.close();

dispatchToPdf()

import cgi
form = cgi.FieldStorage()

print "The user entered %s" % form.getvalue("svg")





