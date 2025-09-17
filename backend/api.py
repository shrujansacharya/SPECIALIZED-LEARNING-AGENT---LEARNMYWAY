# api.py
import sys
import os
from flask import Flask, request, jsonify
from diffusers import StableDiffusionPipeline
import torch
from datetime import datetime

# --- Load the model ONCE at startup ---
MODEL_PATH = "./stable-diffusion-v1-4"
OUTPUT_DIR = "./uploads/theme_images"

try:
    # Use float16 for better performance on GPU
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=dtype, local_files_only=True)
    
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        print("Model loaded successfully on GPU.", file=sys.stderr)
    else:
        pipe = pipe.to("cpu")
        print("Model loaded successfully on CPU.", file=sys.stderr)
except Exception as e:
    print(f"Error loading model: {e}", file=sys.stderr)
    sys.exit(1)

# --- Create the Flask App ---
app = Flask(__name__)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required.'}), 400

    try:
        print("Starting image generation...", file=sys.stderr)
        # --- OPTIMIZATION: Reduce inference steps for faster generation ---
        image = pipe(prompt, num_inference_steps=25).images[0]
        
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        filename = f"{hash(prompt)}-{datetime.now().strftime('%Y%m%d%H%M%S%f')}.png"
        image_path = os.path.join(OUTPUT_DIR, filename)
        
        image.save(image_path)
        
        # Return the relative path
        relative_path = image_path.replace("\\", "/").replace("./", "/")
        print("Image generated successfully.", file=sys.stderr)
        return jsonify({'path': relative_path})

    except Exception as e:
        print(f"Error generating image: {e}", file=sys.stderr)
        return jsonify({'error': 'Failed to generate image.'}), 500

if __name__ == '__main__':
    # Run the Flask app on a different port than your Node.js server
    app.run(host='0.0.0.0', port=5002)