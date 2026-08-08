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
from flask import Flask, render_template, request, jsonify, session, url_for
from flaskwebgui import FlaskUI
from werkzeug.utils import secure_filename, redirect

#app = Flask(__name__)

if hasattr(sys, '_MEIPASS'):
    base_dir = sys._MEIPASS
else:
    base_dir = os.path.abspath(".")

app = Flask(
    __name__,
    template_folder=os.path.join(base_dir, 'templates'),
    static_folder=os.path.join(base_dir, 'static')
)

app.config['TEMPLATES_AUTO_RELOAD'] = True
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
app.secret_key = "secret key" # not required as user data is not being stored, but added for future use if needed
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/",  methods = ['GET', 'POST'])
def home():
   return render_template('image_selector.html')


#@app.route('/shutdown', methods=['POST'])
#def shutdown():
#     os._exit(0)


@app.route('/upload-data', methods=['POST'])
def receive_data():

    print("Received request to upload-data")

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

    pg_count = 0
    for page in inputFile:
        zoom = 3.0 # Don't go higher otherwise image resolution will slow down measurement tool (perhaps look into svg conversion)
        matrix = pymupdf.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=matrix)
        
        pix.save(f"{os.path.join(app.root_path, 'static', 'uploads', file.filename.split('.')[0])}_page-{page.number}.png")
        pg_count += 1

    inputFile.close()

    image_list = []
    for i in range(pg_count):
        image_list.append({
            "filename": file.filename,
            #"data": f"{os.path.join(app.root_path, 'static', 'uploads', file.filename.split('.')[0])}_page-{i}.png"
            "data": f"./static/uploads/{file.filename.split('.')[0]}_page-{i}.png"
        })

    return jsonify({"status": "success", "message": f"Data uploaded for {file.filename}!", "images": image_list}), 200


@app.route('/imgURL', methods=['POST','GET'])
def get_imgURL():
    imgURL = None
    if request.method == 'POST':
        imgURL = request.form.get("src")
        print("selected_img: ", imgURL)
        session['imgURL'] = imgURL
    print("sending imgURL")
    return jsonify({"status": "success", "redirect": url_for('tool')})
    #return render_template('main.html', selected_img=imgURL)


@app.route('/tool')
def tool():
    print("entered tool")
    imgURL = session.get("imgURL")
    return render_template("main.html", selected_img=imgURL)


@app.route('/reset_session', methods=['POST', 'GET'])
def reset_session():

    # Wipes out all stored cookie data for this user
    session.clear()

    # Delete all files in upload folder
    clear_uploads()

    return jsonify({"status": "success", "redirect": url_for('home')})

def clear_uploads():
    folder_path = os.path.join(app.root_path, UPLOAD_FOLDER)
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
    return

if __name__ == '__main__':
   #webbrowser.open("http://127.0.0.1:5000")

    # 1) Development/Debugging

    app.run(host='0.0.0.0', port=5000, debug=True)


    # 2) Production/Desktop GUI

    #FlaskUI(app=app, server="flask").run()