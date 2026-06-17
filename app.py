import os
from flask import Flask, flash, request, render_template
from werkzeug.utils import secure_filename, redirect

app = Flask(__name__)

UPLOAD_FOLDER = 'static/'
app.secret_key = "secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route("/",  methods = ['GET', 'POST'])

def index():
   return render_template('main.html')

if __name__ == '__main__':
    app.run(debug=True)