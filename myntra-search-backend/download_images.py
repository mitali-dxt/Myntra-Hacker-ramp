# download_images.py
import pandas as pd
import requests
from pathlib import Path
from tqdm import tqdm

# --- Configuration ---
DATA_DIR = Path("data")
IMAGE_DIR = DATA_DIR / "Images"
CSV_FILE = DATA_DIR / "products.csv"
MAX_IMAGES_TO_DOWNLOAD = 14330

# --- Main Logic ---
if __name__ == "__main__":
    # Create the image directory if it doesn't exist
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)

    print(f"📄 Reading CSV file from '{CSV_FILE}'...")
    df = pd.read_csv(CSV_FILE)
    df = df.head(MAX_IMAGES_TO_DOWNLOAD)

    print(f" মোট {len(df)}টি ছবি ডাউনলোড করা হচ্ছে... ") # Translates to: "Downloading a total of {len(df)} images..."

    for _, row in tqdm(df.iterrows(), total=df.shape[0], desc="Downloading Images"):
        img_url = row.get('img')
        product_id = row.get('p_id')

        if not all([img_url, product_id]):
            continue # Skip if URL or p_id is missing

        # Define the local filename using the product ID
        local_filepath = IMAGE_DIR / f"{product_id}.jpg"

        # Only download if the file doesn't already exist
        if not local_filepath.exists():
            try:
                response = requests.get(img_url, stream=True)
                response.raise_for_status() # Raise an exception for bad status codes

                with open(local_filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)

            except requests.exceptions.RequestException as e:
                print(f"\n❌ Could not download {img_url}. Error: {e}")

    print("\n✅ Image download process complete.")