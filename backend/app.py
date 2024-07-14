from flask_mail import Mail, Message
import os
from flask import Flask, request, jsonify
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime, timedelta
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from decorators import verify_token
load_dotenv()
from utils.groq_utils import get_recommendations
import razorpay


app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}})


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
mail = Mail(app)

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./firebase_creds.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
user_ref = db.collection('user')


@app.route('/')
def hello_world():
    return 'Hello World'

@app.route('/api/getuser', methods=['GET'])
@verify_token
def getuser(claims):
    try:
        # email = request.args['email']
        # print("email - ", email)
        email = claims['email']
        user = user_ref.where('email', '==', email).get()
        if user: 
            return jsonify(user[0].to_dict()), 200
        else:
            return {'res': 'not found'}, 404
    except Exception as e:
        print("err: ", str(e))
        return {"error": str(e)}, 500

@app.route('/api/userdetails', methods=['POST'])
@verify_token
def userdetails(claims):
    try:
        form_data = request.json
        form_data['user_id'] = claims['user_id']
        form_data['email'] = claims['email']
        form_data['name'] = claims['name']

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

@app.route("/api/chat", methods=["POST"])
def chat_response():
    request_data = request.get_json()

    # Extract the user message
    messages = request_data.get("messages", [])
    user_message = ""
    if messages and "text" in messages[0]:
        user_message = messages[0]["text"]

    # Sample response data
    response_data = {
        "role": "ai",
        "text": f"Received your query: {user_message}. Here's a sample response.",
    }
    feedback = {"role": "ai", "text": "feedback"}

    return [response_data, feedback]

@app.route('/api/fetch_book_details', methods=['POST'])
def fetch_book_details():
    data = request.get_json()
    isbn = data.get('isbn')

    if not isbn:
        return jsonify({"error": "ISBN is required"}), 400

    # Fetch book details from Google Books API
    response = requests.get(GOOGLE_BOOKS_API_URL, params={'q': 'isbn:' + isbn})
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch data from Google Books API"}), response.status_code

    books_data = response.json()
    if 'items' not in books_data or len(books_data['items']) == 0:
        return jsonify({"error": "No books found with the given ISBN"}), 404

    book_info = books_data['items'][0]['volumeInfo']

    # Extract required fields
    book_details = {
        'isbn': isbn,
        'title': book_info.get('title'),
        'author': ', '.join(book_info.get('authors', [])),
        'publisher': book_info.get('publisher'),
        'year': book_info.get('publishedDate', '').split('-')[0],
        'genre': ', '.join(book_info.get('categories', [])),
        'description': book_info.get('description')
    }

    return jsonify(book_details), 200

@app.route('/api/save_book_details', methods=['POST'])
@verify_token
def save_book_details(claims):
    print(claims)
    user_id = claims["user_id"]
    user_ref = db.collection('user')
    user_query = user_ref.where("user_id", "==", user_id)
    user_docs = user_query.stream()

    user_data = None
    for doc in user_docs:
        user_data = doc.to_dict()
        break

    if not user_data:
        return jsonify({"error": "User not found"}), 404
    if user_data["type"] != "librarian" :
        return jsonify({"error": "Unauthorized Access"}), 401
    
    data = request.get_json()
    required_fields = ['isbn', 'title', 'author', 'publisher', 'year', 'genre', 'quantity']

    # Check if all required fields are present in the request
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Save the book details to Firestore
    try:
        book_ref = db.collection('books').document(data['isbn'])
        book_ref.set({
            'isbn': data['isbn'],
            'title': data['title'],
            'author': data['author'],
            'publisher': data['publisher'],
            'year': data['year'],
            'genre': data['genre'],
            'quantity': data['quantity']
        })
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#sends request    
@app.route('/api/borrowing_transaction', methods=['POST'])
@verify_token
def create_borrowing_transaction(claims):
    print(claims)
    user_id = claims["user_id"]
    user_ref = db.collection('user')
    user_query = user_ref.where("user_id", "==", user_id)
    user_docs = user_query.stream()

    user_data = None
    for doc in user_docs:
        user_data = doc.to_dict()
        break

    if not user_data:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json()
    required_fields = ['user_id', 'isbn']

    # Check if all required fields are present in the request
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    # Check if the book is in submitted status
    book_ref = db.collection('books').document(data['isbn'])
    book_doc = book_ref.get()

    if not book_doc.exists:
        return jsonify({"error": "Book not found"}), 404
    book_data = book_doc.to_dict()
    if(book_data['quantity']<=0):
        return jsonify({"quantity": "0"}), 404

    try:
        transaction_id = str(uuid.uuid4())
        transaction_data = {
            'transaction_id': transaction_id,
            'user_id': data['user_id'],
            'book_id': data['isbn'],
            'checkout_date': '',
            'due_date': '',
            'late_fees': 0,
            'status': 'submitted'
        }
        transaction_ref = db.collection('borrowing_transactions').document(transaction_id)
        transaction_ref.set(transaction_data)
        book_data['quantity']=book_data['quantity']-1
        book_ref.update(book_data)
        return jsonify({"success": True, "transaction_id": transaction_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/api/update_transaction_status', methods=['POST'])
@verify_token
def update_transaction_status(claims):
    print(claims)
    user_id = claims["user_id"]
    user_ref = db.collection('user')
    user_query = user_ref.where("user_id", "==", user_id)
    user_docs = user_query.stream()

    user_data = None
    for doc in user_docs:
        user_data = doc.to_dict()
        break

    if not user_data:
        return jsonify({"error": "User not found"}), 404
    if user_data["type"] != "librarian" :
        return jsonify({"error": "Unauthorized Access"}), 401
    
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    if not transaction_id:
        return jsonify({"error": "transaction_id is required"}), 400

    try:
        transaction_ref = db.collection('borrowing_transactions').document(transaction_id)
        transaction_doc = transaction_ref.get()

        if not transaction_doc.exists:
            return jsonify({"error": "Transaction not found"}), 404

        transaction_data = transaction_doc.to_dict()
        transaction_data['status'] = 'accepted'
        transaction_data['checkout_date']= datetime.utcnow().strftime("%Y%m%d%H%M%S")
        transaction_data['due_date']= datetime.utcnow().strftime("%Y%m%d%H%M%S")
        user_ref = db.collection('users').document(transaction_data['user_id'])
        user_doc = user_ref.get()

        book_ref=db.collection('books').document(transaction_data['book_id'])
        book_doc = book_ref.get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
        send_email(user_data['email'], transaction_data['book_id'], transaction_data['due_date'],book_doc.to_dict()['title'])
        transaction_ref.update(transaction_data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/fetch_submitted_transactions', methods=['GET'])
@verify_token
def fetch_submitted_transactions(claims):
    try:
        print(claims)
        user_id = claims["user_id"]
        user_ref = db.collection('user')
        user_query = user_ref.where("user_id", "==", user_id)
        user_docs = user_query.stream()

        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break

        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('status', '==', 'submitted').where("user_id", "==", user_id)
        submitted_transactions = [doc.to_dict() for doc in query.stream()]

        return jsonify({"submitted_transactions": submitted_transactions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Email configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
EMAIL_ADDRESS = 'odookitaabclub@gmail.com'
EMAIL_PASSWORD = 'odoo@1234'

@app.route('/api/send_due_date_reminders', methods=['GET'])
def send_due_date_reminders():
    try:
        today = datetime.now()
        reminder_date = today + timedelta(days=3)
        reminder_date_str = reminder_date.strftime('%Y-%m-%d')

        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('due_date', '==', reminder_date_str)
        due_transactions = [doc.to_dict() for doc in query.stream()]

        for transaction in due_transactions:
            user_ref = db.collection('users').document(transaction['user_id'])
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                send_email(user_data['email'], transaction['book_id'], transaction['due_date'])

        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def send_email(to_email, book_id, due_date,bookName):
    msg = Message(
        subject='Hello! Welcome to Odoo KitaabClub.', 
        sender='odookitaabclub@gmail.com',  # Ensure this matches MAIL_USERNAME
        recipients=[to_email]  # Replace with actual recipient's email
    )
    body = f"Dear User,\n\nThis is a reminder that the book {bookName} with ID {book_id} is due on {due_date}. Please return it by the due date to avoid any late fees.\n\nThank you."
    msg.body = body
    mail.send(msg)

    
# API to search books by title, genre, or author
@app.route('/search', methods=['GET'])
def search_books():
    try:
        query = request.args.get('query')
        field = request.args.get('field')  # 'title', 'genre', or 'author'
        
        if not query or not field:
            return jsonify({"error": "Query and field parameters are required."}), 400
        
        # Query books collection based on the specified field
        books_ref = db.collection('books').where(field, '==', query).get()
        
        books = []
        for doc in books_ref:
            books.append(doc.to_dict())
        
        return jsonify({"success": True, "books": books}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

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

@app.route('/api/get-personalised-recommendations', methods=['GET'])
@verify_token
def get_personalised_recommendations(claims):
    try:
        print(claims)
        user_id = claims["user_id"]
        user_ref = db.collection('user')
        user_query = user_ref.where("user_id", "==", user_id)
        user_docs = user_query.stream()

        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break

        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        
        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('user_id', '==', user_id).where('status', '==', 'accepted')

        transactions = [doc.to_dict() for doc in query.stream()]
        # will contain all the books directly borrowed by the user in the past
        book_details = []

        for transaction in transactions:
            book_id = transaction.get('book_id')
            if book_id:
                # Fetch book details from the 'books' collection
                book_ref = db.collection('books').document(book_id)
                book_doc = book_ref.get()
                if book_doc.exists:
                    book_data = book_doc.to_dict()
                    # Filter and collect only the required fields
                    filtered_book_data = {
                        "genre": book_data.get("genre"),
                        "author": book_data.get("author"),
                        "title": book_data.get("title"),
                        "description": book_data.get("description"),
                    }
                    book_details.append(filtered_book_data)

        # get the current inventory
        book_ref = db.collection('books')
        all_books = [doc.to_dict() for doc in book_ref.stream()]
        filtered_books = [{"title": book.get("title"), "genre": book.get("genre"),"description": book.get("description"),"author": book.get("author"),"isbn": book.get("isbn")} for book in all_books]


        books_arr = get_recommendations(book_details,user_data["age"],user_data["gender"],user_data["location"],user_data["author"],user_data["genre"],filtered_books)

        books = []
        for isbn in books_arr:
            book_ref = db.collection('books').where('isbn', '==', isbn)
            docs = book_ref.stream()
            for doc in docs:
                book_data = doc.to_dict()
                books.append(book_data)
        return jsonify({"data": books}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/book-of-the-day', methods=['GET'])
@verify_token
def get_book_of_the_day(claims):
    try:
        print(claims)
        user_id = claims["user_id"]
        user_ref = db.collection('user')
        user_query = user_ref.where("user_id", "==", user_id)
        user_docs = user_query.stream()

        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break

        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        response = get_personalised_recommendations()
        recoms = response[0].json
        return jsonify({"data": recoms["data"][0]}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/get-profile-data', methods=['GET'])
@verify_token
def get_profile_data(claims):
    try:
        print(claims)
        user_id = claims["user_id"]
        user_ref = db.collection('user')
        user_query = user_ref.where("user_id", "==", user_id)
        user_docs = user_query.stream()

        user_data = None
        for doc in user_docs:
            user_data = doc.to_dict()
            break

        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
        
        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('user_id', '==', user_id).where('status', '==', 'submitted')

        transactions = [doc.to_dict() for doc in query.stream()]
        # will contain all the books directly borrowed by the user in the past
        book_details = []
        total_overdue = 0

        print(transactions)

        for transaction in transactions:
            input_date_str = transaction.get('due_date')
            input_date = datetime.strptime(input_date_str, '%Y-%m-%d')
        
            # Get the current date
            today_date = datetime.now().strftime('%Y-%m-%d')
            today_date_obj = datetime.strptime(today_date, '%Y-%m-%d')
            
            # Calculate the difference between the two dates
            date_difference = input_date - today_date_obj
            days_out = date_difference.days
            
            if days_out > 0:
                overdue = 0
            else:
                overdue = (days_out) * 10
            book_id = transaction.get('book_id')
            if book_id:
                # Fetch book details from the 'books' collection
                book_ref = db.collection('books').document(book_id)
                book_doc = book_ref.get()
                if book_doc.exists:
                    book_data = book_doc.to_dict()
                    # Filter and collect only the required fields
                    filtered_book_data = {
                        "genre": book_data.get("genre"),
                        "author": book_data.get("author"),
                        "title": book_data.get("title"),
                        "description": book_data.get("description"),
                        "imageLink": book_data.get("imageLink"),
                        "isbn": book_data.get("isbn"),
                        "due_date_left":days_out,
                        "fees" : overdue
                    }
                    book_details.append(filtered_book_data)
                    total_overdue = total_overdue+overdue
        
        return jsonify({"books": book_details,"overdue":total_overdue}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
@app.route('/create_order', methods=['POST'])
def createOrder():
    try:
        client = razorpay.Client(auth=(os.environ.get('RAZORPAY_USERNAME'),os.environ.get('RAZORPAY_PASSWORD')))
        data = { "amount": 500, "currency": "INR", "receipt": "order_rcptid_11" }
        payment = client.order.create(data=data)

        return jsonify({"id":payment.get("id"),"amount":payment.get("amount"),"currency":payment.get("currency")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500    

    
if __name__ == '__main__':
    app.run(debug=True)