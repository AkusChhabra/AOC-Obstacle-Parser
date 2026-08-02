"""

Made by A.Chhabra

app.py runs the Flask application allowing users to upload files, processes them, 
and provides an easy to use web interface, simplifying the user experience.  

Due to constraints of node.js not being enabled in the desired environment,
flask was used to create a local server that can be accessed through a web browser.

"""

import os
import sys
import json
import pymupdf
from flask import Flask, render_template, send_from_directory, request, jsonify
from flaskwebgui import FlaskUI
#from werkzeug.utils import secure_filename, redirect

app = Flask(__name__)

UPLOAD_FOLDER = 'static/'
app.secret_key = "secret key" # not required as user data is not being stored, but added for future use if needed
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

#@app.route('/node_modules/<path:filename>')
#def serve_node_modules(filename):
#    return send_from_directory(os.path.join(app.root_path, 'node_modules'), filename)

@app.route("/",  methods = ['GET', 'POST'])
def index():
   return render_template('main.html')

@app.route('/shutdown', methods=['POST'])
def shutdown():
     os._exit(0)


@app.route('/api/receive-data', methods=['POST'])
def receive_data():
    # Extract JSON data from the request body

    print("Received request to /api/receive-data")

    data = request.get_json()
    data = json.loads(data) if isinstance(data, str) else data
    print("data: ", data)
    
    # Access individual variables safely
    file = data.get('fileData')
    scale = data.get('scale')
    
    # Process your data here (e.g., save to database)
    print(f"Received data: File={file}, Scale={scale}")

    inputFile = pymupdf.open(file)

    for page in inputFile:
        zoom = 5.0 # Don't go higher otherwise image resolution will slow down measurement tool (perhaps look into svg conversion)
        matrix = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix)
        
        pix.save(f"page-{page.number}.png")

    inputFile.close()
    
    # Send a JSON response back to JavaScript
    return jsonify({
        "status": "success", 
        "message": f"Data received for {file}!"
    }), 200

## Cache Control
#@app.after_request
#def add_header(response):
#    response.headers['Cache-Control'] = 'no-store'
#    return response

if __name__ == '__main__':
   #webbrowser.open("http://127.0.0.1:5000")

    # 1) Development/Debugging

    app.run(host='127.0.0.1', port=5000, debug=True)


    # 2) Production/Desktop GUI

    #FlaskUI(app=app, server="flask").run()