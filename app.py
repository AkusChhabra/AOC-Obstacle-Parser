import os
from flask import Flask, flash, request, render_template
from werkzeug.utils import secure_filename, redirect

app = Flask(__name__)

UPLOAD_FOLDER = 'static/'
app.secret_key = "secret key"
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

allowed_exts = set(['png', 'jpg', 'jpeg'])

def allowed_file(filename):
	return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts

@app.route("/",  methods = ['GET', 'POST'])

def index():
   return render_template('main.html')

@app.route('/upload')
def upload_file():
   return render_template('upload.html')

@app.route('/uploader', methods = ['GET', 'POST'])
def upload_file2():
   if request.method == 'POST':
      f = request.files['file']
      if f.filename == '':
         flash('No image selected for uploading')
         return redirect(request.url)
      if f and allowed_file(f.filename):
         filename = secure_filename(f.filename)
         f.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
         flash('Image successfully uploaded and displayed below')
         return render_template('dashboard.html', filename=filename)
      else:
         flash('Allowed image types are - png, jpg, jpeg')
         return redirect(request.url)
      #f.save(secure_filename(f.filename))
      #return redirect('/dashboard')

@app.route('/dashboard', methods = ['GET'])
def dashboard():
   return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)