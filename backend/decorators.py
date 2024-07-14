from functools import wraps
from flask import request, abort
from firebase_admin import auth
import datetime

def verify_token(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(*args, **kwargs)
        
        auth_header = request.headers.get("X-Firebase-AppCheck")
        
        if auth_header is None:
            abort(401)
        
        try:
            app_check_token = auth_header
            # Verify ID token 
            app_check_claims = auth.verify_id_token(app_check_token, check_revoked=True)
            # print(f"Verified claims: {app_check_claims}")
            # Pass the claims to the route
            return f(*args, **kwargs, claims=app_check_claims)
        except Exception as e:
            print(f"Error: {str(e)}")
            abort(401)
    
    return decorated_function