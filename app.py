import os
import sys
import signal
import webbrowser
from flask import Flask, flash, request, render_template, Flask, jsonify
from werkzeug.utils import secure_filename, redirect
import pymupdf
import tkinter as tk
from tkinter import filedialog

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

@app.route("/",  methods = ['GET', 'POST'])
def index():
   return render_template('main.html')

#@app.route('/run-script', methods=['POST'])
#def run_script():
#    try:
#        root = tk.Tk()
#        root.withdraw()
#
#        file_path = filedialog.askopenfilename()
#        checkPath(file_path)
#
#       inputFile = pymupdf.open(file_path)
#
#       for page in inputFile:
#           zoom = 5.0 # Don't go higher otherwise image resolution will slow down measurement tool (perhaps look into svg conversion)
#           matrix = pymupdf.Matrix(zoom, zoom)
#           pix = page.get_pixmap(matrix=matrix)
#           
#           pix.save(f"page-{page.number}.png")
#
#       inputFile.close()
#       
#       return jsonify(status="success", message="Script executed successfully"), 200
#   except Exception as e:
#       return jsonify(status="error", message=str(e)), 500


#@app.route('/shutdown', methods=['POST'])
#def shutdown():
#    # Retrieve the shutdown function from the Werkzeug server
#    shutdown_func = request.environ.get('werkzeug.server.shutdown')
#    if shutdown_func is None:
#        # Fallback to os.kill if running in production/different WSGI
#        os.kill(os.getpid(), signal.SIGINT)
#        return 'Server killed'
#    
#    shutdown_func()
#    return 'Server shutting down...'

#@app.route('/shutdown', methods=['POST'])
#def shutdown():
#    os.kill(os.getpid(), signal.SIGTERM)
#    return jsonify({"success": True, "message": "Server shutting down..."})

@app.route('/shutdown', methods=['POST'])
def shutdown():
     os._exit(0)

## Functions
#def checkPath(file_path):
#    if file_path:
#        print(f"Selected file: {file_path}")
#    else:
#        print("User cancelled the dialog.")

if __name__ == '__main__':
   webbrowser.open("http://127.0.0.1:5000")
   app.run(host='127.0.0.1', port=5000, debug=False)