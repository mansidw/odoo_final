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
        
        return jsonify({"success": True, "books": books}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/most_trending', methods=['GET'])
def most_trending_books():
    try:
        books_ref = db.collection('books').order_by('borrow_count', direction=firestore.Query.DESCENDING).limit(10).get()
        books = []
        for doc in books_ref:
            books.append(doc.to_dict())
        
        return jsonify(books), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
