import sys
from diffusers import StableDiffusionPipeline
import torch
import os
from datetime import datetime

# Path to the downloaded model folder
MODEL_PATH = "./stable-diffusion-v1-4"
OUTPUT_DIR = "./uploads/theme_images"

# Load the model
try:
    # Set the model to a low-level data type for CPU compatibility
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=torch.float32)
    
    # Use 'cuda' for GPU or 'cpu' if no GPU
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        sys.stderr.write("Model loaded successfully on GPU.\n")
    else:
        pipe = pipe.to("cpu")
        sys.stderr.write("Model loaded successfully on CPU.\n")
        
except Exception as e:
    sys.stderr.write(f"Error loading model: {e}\n")
    sys.exit(1)

# Function to generate and save an image
def generate_image(prompt):
    try:
        sys.stderr.write("Starting image generation...\n")
        # Generate the image
        image = pipe(prompt).images[0]
        
        # Create output directory if it doesn't exist
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Create a unique filename
        filename = f"{hash(prompt)}-{datetime.now().strftime('%Y%m%d%H%M%S%f')}.png"
        image_path = os.path.join(OUTPUT_DIR, filename)
        
        # Save the image
        image.save(image_path)
        
        # Print the relative path for Node.js to read
        print(image_path.replace("\\", "/").replace("./", "/"))
        sys.stderr.write("Image generated successfully.\n")
    except Exception as e:
        sys.stderr.write(f"Error generating image: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        prompt = sys.argv[1]
        generate_image(prompt)
    else:
        sys.stderr.write("Error: No prompt provided.\n")
        sys.exit(1)