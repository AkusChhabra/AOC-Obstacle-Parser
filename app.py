from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/",  methods = ['GET', 'POST'])

def index():
    return render_template('main.html')


@app.route('/login', methods=['GET', 'POST'])

def login():
    if request.method == 'POST':
        name = request.form['username']
        return f"Hello {name}, POST request received"
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)