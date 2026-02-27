from flask import Flask, request, jsonify, make_response
from detector import analyze_image, analyze_from_url, ALLOWED_EXTENSIONS
import os, uuid, time

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory history (last 20 analyses)
history = []
MAX_FILE_SIZE_MB = 10
MAX_HISTORY = 20


def add_cors(response):
    """Add CORS headers to allow the React frontend to call this API."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.after_request
def after_request(response):
    return add_cors(response)


@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify({"status": "ok", "message": "DeepGuard Pro API is running!"})


@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze():
    if request.method == 'OPTIONS':
        return make_response('', 204)

    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"error": f"Unsupported file type '{ext}'. Allowed: JPG, PNG, WEBP, BMP, GIF"}), 400

    filename = f"{uuid.uuid4()}{ext}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)

    # Check file size
    size_mb = os.path.getsize(path) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        os.remove(path)
        return jsonify({"error": f"File too large ({size_mb:.1f} MB). Max allowed: {MAX_FILE_SIZE_MB} MB"}), 400

    try:
        result = analyze_image(path)
        result['filename'] = file.filename
        result['id'] = str(uuid.uuid4())
        result['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
        history.insert(0, result)
        if len(history) > MAX_HISTORY:
            history.pop()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(path):
            os.remove(path)


@app.route('/analyze-url', methods=['POST', 'OPTIONS'])
def analyze_url():
    if request.method == 'OPTIONS':
        return make_response('', 204)

    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({"error": "No URL provided"}), 400

    url = data['url'].strip()
    if not url:
        return jsonify({"error": "URL cannot be empty"}), 400

    try:
        result = analyze_from_url(url)
        result['filename'] = url.split('/')[-1].split('?')[0][:60] or url[:60]
        result['id'] = str(uuid.uuid4())
        result['timestamp'] = time.strftime('%Y-%m-%d %H:%M:%S')
        history.insert(0, result)
        if len(history) > MAX_HISTORY:
            history.pop()
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/history', methods=['GET', 'OPTIONS'])
def get_history():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    return jsonify(history)


@app.route('/history', methods=['DELETE', 'OPTIONS'])
def clear_history():
    if request.method == 'OPTIONS':
        return make_response('', 204)
    history.clear()
    return jsonify({"message": "History cleared"})


if __name__ == '__main__':
    print("\n🛡️  DeepGuard Pro API starting...")
    print("📡  Running at http://localhost:5001\n")
    app.run(debug=True, port=5001)
