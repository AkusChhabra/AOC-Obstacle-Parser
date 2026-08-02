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
from flask import Flask, render_template, send_from_directory, request, jsonify, url_for, Response
from flaskwebgui import FlaskUI
from werkzeug.utils import secure_filename, redirect

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.secret_key = "secret key" # not required as user data is not being stored, but added for future use if needed
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

if hasattr(sys, '_MEIPASS'):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.abspath(".")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

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


@app.route('/api/upload-data', methods=['POST'])
def receive_data():

    print("Received request to /api/upload-data")

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']  # Access the uploaded file

    scale = request.form.get('scale', default=1, type=int)

    print("file_obj: ", file)  # Print the filename for debugging

    file.save(os.path.join(os.path.join(app.root_path, 'static', 'uploads'), file.filename))
    print(f"File saved to: {os.path.join(app.root_path, 'static', 'uploads', file.filename)}")
    
    print(f"Uploaded data: File={file.filename}, Scale={scale}")

    #file_bytes = file.read()

    #inputFile = pymupdf.open(stream=file_bytes, filetype="pdf")
    print(f"Opening file: {os.path.join(os.path.join(app.root_path, 'static', 'uploads'), file.filename)}")
    inputFile = pymupdf.open(os.path.join(os.path.join(app.root_path, 'static', 'uploads'), file.filename), filetype="pdf")

    for page in inputFile:
        zoom = 3.0 # Don't go higher otherwise image resolution will slow down measurement tool (perhaps look into svg conversion)
        matrix = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix)
        
        pix.save(f"{os.path.join(app.root_path, 'static', 'uploads', file.filename.split('.')[0])}_page-{page.number}.png")

    inputFile.close()
    
    # Send a JSON response back to Frontend
    return jsonify({
        "status": "success", 
        "message": f"Data uploaded for {file}!"
    }), 200


@app.route('/api/download-data', methods=['GET'])
def download_data():
    # Implementation for downloading processed data
    pass



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