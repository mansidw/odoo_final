from flask import Flask, request, jsonify
import requests
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta

app = Flask(__name__)

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
@app.route('/borrowing_transaction', methods=['POST'])
def create_borrowing_transaction():
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

    # Create borrowing transaction
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

        transaction_data = transaction_doc.to_dict()
        transaction_data['status'] = 'accepted'
        transaction_data['checkout_date']= datetime.utcnow().strftime("%Y%m%d%H%M%S")
        transaction_data['due_date']= datetime.utcnow().strftime("%Y%m%d%H%M%S")

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
    

# Email configuration
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
EMAIL_ADDRESS = 'odookitaabclub@gmail.com'
EMAIL_PASSWORD = 'odoo@1234'

@app.route('/send_due_date_reminders', methods=['GET'])
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

@app.route('/send_mail', methods=['GET'])
def send_email(to_email="pranjalravipatil@gmail.com", book_id="", due_date=""):
    try:
        # Set up the MIME
        message = MIMEMultipart()
        message['From'] = EMAIL_ADDRESS
        message['To'] = to_email
        message['Subject'] = 'Book Due Date Reminder'

        body = f"Dear User,\n\nThis is a reminder that the book with ID {book_id} is due on {due_date}. Please return it by the due date to avoid any late fees.\n\nThank you."
        message.attach(MIMEText(body, 'plain'))

        # Send the email
        session = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        session.starttls()
        session.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = message.as_string()
        session.sendmail(EMAIL_ADDRESS, to_email, text)
        session.quit()
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")



if __name__ == '__main__':
    app.run(debug=True)
