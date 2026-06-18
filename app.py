import os
import sys
import signal
import webbrowser
from flask import Flask, flash, request, render_template, Flask, jsonify
from werkzeug.utils import secure_filename, redirect

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

@app.route('/shutdown', methods=['POST'])
def shutdown():
    os.kill(os.getpid(), signal.SIGTERM)
    return jsonify({"success": True, "message": "Server shutting down..."})

if __name__ == '__main__':
   webbrowser.open("http://127.0.0.1:5000")
   app.run(host='127.0.0.1', port=5000, debug=False)