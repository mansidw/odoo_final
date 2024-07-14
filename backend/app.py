from flask import Flask, jsonify, request
from firebase_admin import credentials, firestore, initialize_app, app_check, auth
from dotenv import load_dotenv
from flask_cors import CORS, cross_origin
import flask
from uuid import uuid4
from datetime import datetime

from decorators import verify_token

load_dotenv()
app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})

cred = credentials.Certificate('key.json')
default_app = initialize_app(cred)
db = firestore.client()

user_ref = db.collection('user')


@app.route('/')
def hello_world():
    return 'Hello World'

@app.route('/api/getuser', methods=['GET'])
@verify_token
def getuser(claims):
    try:
        email = claims['email']
        user = user_ref.where('email', '==', email).get()
        if user: 
            return jsonify(user[0].to_dict()), 200
        else:
            return {'res': 'not found'}, 404
    except Exception as ex:
        print("err: ", str(ex))
        return {"error": str(e)}, 500

@app.route('/api/userdetails', methods=['POST'])
@verify_token
def userdetails(claims):
    try:
        form_data = request.json
        form_data['user_id'] = claims['user_id']
        form_data['email'] = claims['email']

        user = user_ref.add(form_data)
        user = user[1].get().to_dict()
        print(user)

        return {"res": "success", "data": user}, 200
    except Exception as e: 
        print(str(e))
        return {"error": str(e)}, 500

@app.route('/check-auth', methods=['GET','POST'])
@verify_token
def checkauth(claims):
    try:
        return {"res":" working"}, 200
    except Exception as ex:
        return {"error": str(ex)}, 500
    
@app.route('/new_arrivals', methods=['GET'])
def new_arrival_books():
    try:
        today_date = datetime.now().strftime("%Y-%m-%d")
        
        # Query books collection where timestamp equals today's date
        books_ref = db.collection('books').where('timestamp', '==', today_date).limit(5).get()
        
        books = []
        for doc in books_ref:
            books.append(doc.to_dict())
        
        return jsonify(books), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/most_trending', methods=['GET'])
def most_trending_books():
    try:
        books_ref = db.collection('books').order_by('borrow_count', direction=firestore.Query.DESCENDING).limit(3).get()
        books = []
        for doc in books_ref:
            books.append(doc.to_dict())
        
        return jsonify(books), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# API to search ALL books 
@app.route('/searchAll', methods=['GET'])
def search_allbooks():
    try:
        
        books_ref = db.collection('books').get()
        books = []
        for doc in books_ref:
            books.append(doc.to_dict())
        
        return jsonify({"success": True, "books": books}), 200
    
    except Exception as e:
        return jsonify(books), 500

if __name__ == '__main__':
    app.run(debug=True)
