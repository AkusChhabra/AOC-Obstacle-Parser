"""

Made by A.Chhabra

app.py runs the Flask application allowing users to upload files, processes them, 
and provides an easy to use web interface, simplifying the user experience.  

Due to constraints of node.js not being enabled in the desired environment,
flask was used to create a local server that can be accessed through a web browser.

"""

import os
import sys
#import signal
#import webbrowser
#from flask import Flask, flash, request, render_template, jsonify
from flask import Flask, render_template
from flaskwebgui import FlaskUI
#from werkzeug.utils import secure_filename, redirect
#import pymupdf

app = Flask(__name__)

UPLOAD_FOLDER = 'static/'
app.secret_key = "secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

if hasattr(sys, '_MEIPASS'):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.abspath(".")

app = Flask(
    __name__,
    template_folder=os.path.join(base_dir, 'templates'),
    static_folder=os.path.join(base_dir, 'static')
)

ui = FlaskUI(app=app, server="flask", width=800, height=600) 

@app.route("/",  methods = ['GET', 'POST'])
def index():
   return render_template('main.html')

@app.route('/shutdown', methods=['POST'])
def shutdown():
     os._exit(0)

## Cache Control
#@app.after_request
#def add_header(response):
#    response.headers['Cache-Control'] = 'no-store'
#    return response

if __name__ == '__main__':
   #webbrowser.open("http://127.0.0.1:5000")
   #app.run(host='127.0.0.1', port=5000, debug=False)
    FlaskUI(app=app, server="flask").run()
   #ui.run()