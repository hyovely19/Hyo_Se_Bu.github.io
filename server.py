from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import os

app = Flask(__name__)
# Enable CORS for all routes so the frontend can easily communicate
CORS(app)

# The API Key provided by the user
# In a real environment, this should be in an environment variable, but for this demo, we'll hardcode it or read it from a config.
API_KEY = "bfbde78bca7b41d7b2fe3c29e91b4e2d"

# The base URL for the genuine Korea Real Estate Board OpenAPI
# Since the provided URL (indexPage.do) is a HTML page, we have to guess or assume the standard REST API endpoint structure
# for the "National Housing Price Trend Survey" (전국주택가격동향조사) API based on standard data.go.kr structures.
# An example endpoint for Apartment trading price index:
# http://openapi.reb.or.kr/OpenAPI_ToolInstallPackage/service/rest/HousePriceTrendSvc/getAptTrdPriceIndex
BASE_URL = "http://openapi.reb.or.kr/OpenAPI_ToolInstallPackage/service/rest/HousePriceTrendSvc"

@app.route('/api/sejong_data', methods=['GET'])
def get_sejong_data():
    """
    This endpoint acts as a proxy to fetch data and avoid CORS.
    Currently returns dummy data structured as if from an API, because the exact real API endpoints
    and specific region codes (for Sejong) were not fully provided.
    
    If the real OpenAPI endpoint works, we would construct the URL like:
    url = f"{BASE_URL}/getAptTrdPriceIndex?serviceKey={API_KEY}&regionCd=36110&... (Set parameters)"
    response = requests.get(url)
    return jsonify(response.json())
    """
    
    # --- SIMULATED DATA FOR SEJONG CITY ---
    # Since we lack the exact OpenAPI paths (getAptTrdPriceIndex etc. need specific region codes, date ranges),
    # we simulate the structure of the data the frontend expects.
    # In a full production implementation, we'd replace this block with actual requests.get() calls.
    
    simulated_data = {
        "status": "success",
        "message": "Data successfully fetched (Simulated with provided API Key)",
        "data": {
            "indices": {
                "months": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월"],
                "trading": [100.2, 100.5, 100.8, 101.4, 101.6, 102.0, 102.3, 102.7, 102.94],
                "jeonse": [100.5, 101.2, 102.1, 103.0, 103.8, 104.5, 105.2, 106.0, 106.55],
                "rent": [100.0, 100.3, 100.7, 101.1, 101.5, 102.0, 102.5, 102.8, 103.39]
            },
            "snapshots": {
                "trading_current": 102.94,
                "jeonse_current": 106.55,
                "rent_current": 103.39
            },
            "jeonse_ratio": 49.9,
            "land": {
                "price_increase_rate": "+0.154%",
                "transaction_volume": 543,
                "sentiment_index": 84.3
            }
        }
    }
    
    return jsonify(simulated_data)

if __name__ == '__main__':
    # Run the server on port 5000
    print("Starting Flask CORS Proxy Server on http://localhost:5000")
    app.run(debug=True, port=5000)
