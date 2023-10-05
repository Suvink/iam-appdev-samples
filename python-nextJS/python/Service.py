from flask import Flask, render_template, jsonify, request
import jwt
import os
import logging
import json
import httpx

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)
items = []  # In-memory list to store items
ALGORITHMS = ["RS256"]

# GET API to retrieve all items
@app.route('/items', methods=['GET'])
def get_items():

    logging.info('Handling request')
    logging.info('request.headers : %s', request.headers)
    if request.headers.get('x-jwt-assertion'):
        token = request.headers['x-jwt-assertion']
    else:
        return jsonify({'message': 'Token not found'}), 400
    token_info = decode_access_token(token)
    username = token_info.get('email')
    logging.info('username : ' + username)
    
    return jsonify(items)

# POST API to add an item
@app.route('/items', methods=['POST'])
def add_item():

    logging.info('Handling request')
    logging.info('request.headers : %s', request.headers)
    if request.headers.get('x-jwt-assertion'):
        token = request.headers['x-jwt-assertion']
    else:
        return jsonify({'message': 'Token not found'}), 400
    token_info = decode_access_token(token)
    username = token_info.get('email')
    logging.info('username : ' + username)
    
    item = request.json
    items.append(item)
    return jsonify({'message': 'Item added successfully'})


def decode_access_token(token):

    try:
        # get public key from jwks uri
        response = httpx.get(url="https://gateway.e1-us-east-azure.choreoapis.dev/.wellknown/jwks")

        # gives the set of jwks keys.the keys has to be passed as it is to jwt.decode() for signature verification.
        jwks = response.json()
        
        public_keys = {}
        for jwk in jwks['keys']:
            kid = jwk['kid']
            public_keys[kid] = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))
        
        
        kid = jwt.get_unverified_header(token)['kid']
        key = public_keys[kid]

        logging.info('key : ' + str(key))
        payload = jwt.decode(token, key=key, algorithms=['RS256'])
    except Exception as e:
         raise AuthError({"code": "invalid_header",
                            "description":
                                "Unable to parse authentication token."}, 401)
    
    # payload = jwt.decode(token, options={"verify_signature": False})
    return payload

# Format error response and append status code.
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)

