import os
import torch

# Allowed image extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif'}

# Try to load the AI model — only available when transformers + torch are installed
detector = None
clip_model = None
clip_processor = None

try:
    from transformers import CLIPProcessor, CLIPModel
    import torch
    print("🤖 Loading CLIP model for AI-generated image detection...")
    clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
    clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    print("✅ CLIP Model loaded successfully!")
except ImportError:
    print("⚠️  WARNING: 'transformers' or 'torch' not installed.")
    print("   Install with: pip3 install transformers torch torchvision")
except Exception as e:
    print(f"⚠️  WARNING: Could not load CLIP model: {e}")

# Also try to load the deepfake detector as fallback
try:
    from transformers import pipeline
    print("🤖 Loading deepfake detection model...")
    detector = pipeline(
        "image-classification",
        model="dima806/deepfake_vs_real_image_detection"
    )
    print("✅ Deepfake detector loaded!")
except Exception as e:
    print(f"⚠️  Could not load deepfake model: {e}")


def analyze_image(image_path):
    """Analyze a local image file for deepfake/AI-generated detection using CLIP zero-shot."""
    global clip_model, clip_processor
    
    if clip_model is None or clip_processor is None:
        raise RuntimeError(
            "AI model is not available. Please install: pip3 install transformers torch torchvision"
        )

    ext = os.path.splitext(image_path)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")

    from PIL import Image
    image = Image.open(image_path).convert('RGB')
    
    # Use CLIP zero-shot classification
    labels = [
        'a real photograph of a person',
        'an AI generated or synthetic image of a person'
    ]
    
    inputs = clip_processor(text=labels, images=image, return_tensors='pt', padding=True)
    with torch.no_grad():
        outputs = clip_model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = logits_per_image.softmax(dim=1)
    
    real_score = probs[0][0].item()
    fake_score = probs[0][1].item()
    
    print(f"🔍 CLIP scores - Real: {real_score:.4f}, Fake: {fake_score:.4f}")
    
    # Verdict based on which score is higher
    if fake_score > real_score:
        verdict = "FAKE"
        confidence = round(fake_score * 100, 2)
    else:
        verdict = "REAL"
        confidence = round(real_score * 100, 2)
    
    return {
        "result": verdict,
        "confidence": confidence,
        "label": verdict,
        "all_scores": [
            {"label": "Real (photo)", "score": round(real_score * 100, 2)},
            {"label": "Fake (AI-generated)", "score": round(fake_score * 100, 2)}
        ]
    }


def analyze_from_url(url):
    """Download image from URL and analyze it."""
    if detector is None:
        raise RuntimeError(
            "AI model is not available. Please install: pip3 install transformers torch torchvision"
        )

    if not url.startswith(('http://', 'https://')):
        raise ValueError("Invalid URL. Must start with http:// or https://")

    import requests
    from PIL import Image
    from io import BytesIO

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()

    content_type = response.headers.get('Content-Type', '')
    if 'image' not in content_type:
        raise ValueError(f"URL does not point to an image (Content-Type: {content_type})")

    img = Image.open(BytesIO(response.content)).convert('RGB')

    os.makedirs('uploads', exist_ok=True)
    temp_path = f"uploads/temp_url_{os.getpid()}.jpg"
    img.save(temp_path)

    try:
        result = analyze_image(temp_path)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    return result
