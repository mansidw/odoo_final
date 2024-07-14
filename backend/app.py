from flask import Flask, request, jsonify
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

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

@app.route('/fetch_book_details', methods=['POST'])
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

@app.route('/save_book_details', methods=['POST'])
def save_book_details():
    data = request.get_json()
    # Fetch book details from Google Books API
    response = requests.get(GOOGLE_BOOKS_API_URL, params={'q': 'isbn:' + data['isbn']})
    books_data = response.json()

    book_info = books_data['items'][0]['volumeInfo']
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
            'quantity': data['quantity'],
            'imageLink': book_info['imageLinks']['thumbnail'] if 'imageLinks' in book_info else ''
        })
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#sends request    
@app.route('/borrowing_transaction', methods=['POST'])
def create_borrowing_transaction():
    data = request.get_json()
    required_fields = ['user_id', 'isbn']

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

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
    
    
@app.route('/update_transaction_status', methods=['POST'])
def update_transaction_status():
    data = request.get_json()
    transaction_id = data.get('transaction_id')
    if not transaction_id:
        return jsonify({"error": "transaction_id is required"}), 400

    try:
        transaction_ref = db.collection('borrowing_transactions').document(transaction_id)
        transaction_doc = transaction_ref.get()

        if not transaction_doc.exists:
            return jsonify({"error": "Transaction not found"}), 404
        checkout_date = datetime.utcnow()
        def add_working_days(start_date, days_to_add):
            current_date = start_date
            while days_to_add > 0:
                current_date += timedelta(days=1)
                # Check if the day is a weekend (Saturday or Sunday)
                if current_date.weekday() in [5, 6]:
                    continue
                days_to_add -= 1
            return current_date

        checkout_date_plus_week = add_working_days(checkout_date, 5)
        transaction_data = transaction_doc.to_dict()
        transaction_data['status'] = 'accepted'
        transaction_data['checkout_date']= checkout_date_plus_week.strftime("%Y%m%d")
        transaction_data['due_date']= datetime.utcnow().strftime("%Y%m%d")
        transaction_ref.update(transaction_data)
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/fetch_submitted_transactions', methods=['GET'])
def fetch_submitted_transactions():
    try:
        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('status', '==', 'submitted')
        submitted_transactions = [doc.to_dict() for doc in query.stream()]

        return jsonify({"submitted_transactions": submitted_transactions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/send_due_date_reminders', methods=['GET'])
def send_due_date_reminders():
    try:
        today = datetime.now()
        reminder_date = today + timedelta(days=3)
        reminder_date_str = reminder_date.strftime('%Y-%m-%d')

        transactions_ref = db.collection('borrowing_transactions')
        query = transactions_ref.where('due_date', '>=', reminder_date_str)
        due_transactions = [doc.to_dict() for doc in query.stream()]
        print(due_transactions)
        for transaction in due_transactions:
            user_ref = db.collection('user').document(transaction['user_id'])
            user_doc = user_ref.get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                send_email(user_data['email'], transaction['book_id'], transaction['due_date'])

        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def send_email(to_email, book_id, due_date):
    msg = Message(
        subject='Hello! Welcome to Odoo KitaabClub.', 
        sender='odookitaabclub@gmail.com',  # Ensure this matches MAIL_USERNAME
        recipients=[to_email]  # Replace with actual recipient's email
    )
    body = f"Dear User,\n\nThis is a reminder that the book with ID {book_id} is due on {due_date}. Please return it by the due date to avoid any late fees.\n\nThank you."
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

@app.route('/getBooksForUser/<user_id>', methods=['GET'])
def getBooksForUser(user_id):
    try:
        transactions_ref = db.collection('borrowing_transactions').where('user_id', '==', user_id).stream()
        transactions = []

        for transaction in transactions_ref:
            transaction_data = transaction.to_dict()
            transactions.append(transaction_data)

        return jsonify(transactions), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)
