import os
from pathlib import Path
from typing import List, Optional
import tempfile
import numpy as np
import pandas as pd
from tqdm import tqdm
import pickle 
import google.generativeai as genai

from haystack.core.pipeline import Pipeline
from haystack.dataclasses import Document
from haystack.components.embedders.image import SentenceTransformersDocumentImageEmbedder
from haystack.components.embedders.sentence_transformers_text_embedder import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.writers import DocumentWriter

from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

IMAGE_DIR = Path("data") / "Images"
CSV_FILE = Path("data") / "products.csv"
STORE_FILE_PATH = Path("myntra_document_store.pkl")  
MODEL_NAME = "sentence-transformers/clip-ViT-L-14"   
MAX_PRODUCTS_TO_INDEX = 14330

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("⚠️ Google API Key not found. Vibe search will be disabled.")

document_store = InMemoryDocumentStore(embedding_similarity_function="cosine")
text_embedder = SentenceTransformersTextEmbedder(model=MODEL_NAME)
image_embedder = SentenceTransformersDocumentImageEmbedder(model=MODEL_NAME, batch_size=32)
retriever = InMemoryEmbeddingRetriever(document_store=document_store)

def index_products_from_csv():
    global document_store
    print("🚀 Starting product indexing process from CSV...")

    # Load existing documents if the file exists
    if STORE_FILE_PATH.exists():
        print(f"🧠 Found existing documents file. Loading '{STORE_FILE_PATH}'...")
        with open(STORE_FILE_PATH, "rb") as f:
            # We load the LIST of documents, not the store object
            all_docs = pickle.load(f)
        document_store.write_documents(all_docs)
        print(f"✅ Loaded {document_store.count_documents()} documents into the store.")
    
    # --- Prepare all documents from CSV and filter out those already indexed ---
    df = pd.read_csv(CSV_FILE).head(MAX_PRODUCTS_TO_INDEX)
    df.drop_duplicates(subset=['p_id'], inplace=True)
    df = df.where(pd.notnull(df), None)
    
    existing_ids = {doc.id for doc in document_store.filter_documents()}
    
    documents_to_index = []
    print(f"🖼️ Preparing documents...")
    for _, row in df.iterrows():
        product_id = row.get('p_id')
        if not product_id or product_id in existing_ids:
            continue
        image_path = IMAGE_DIR / f"{product_id}.jpg"
        if not image_path.exists():
            continue
        product_description = f"{row.get('name', '')} by {row.get('brand', '')}. Color: {row.get('colour', '')}. Description: {row.get('description', '')}"
        doc = Document(id=product_id, content=product_description, meta={"file_path": str(image_path.resolve())})
        documents_to_index.append(doc)

    if not documents_to_index:
        print("✅ All products are already indexed. Nothing to do.")
        return

    # --- Build the pipeline ---
    indexing_pipeline = Pipeline()
    indexing_pipeline.add_component("embedder", image_embedder)
    indexing_pipeline.add_component("writer", DocumentWriter(document_store=document_store, policy="overwrite"))
    indexing_pipeline.connect("embedder.documents", "writer.documents")

    # --- Run the pipeline in batches, saving after each batch ---
    batch_size = 64
    print(f"🧠 Indexing {len(documents_to_index)} new products in batches of {batch_size}...")
    
    for i in tqdm(range(0, len(documents_to_index), batch_size), desc="Indexing Batches"):
        batch = documents_to_index[i:i + batch_size]
        try:
            indexing_pipeline.run({"embedder": {"documents": batch}})
            
            # Save the LIST of ALL documents in the store after each successful batch
            all_docs_in_store = document_store.filter_documents()
            with open(STORE_FILE_PATH, "wb") as f:
                pickle.dump(all_docs_in_store, f)
                
        except Exception as e:
            print(f"\n⚠️ Could not process a batch. Error: {e}. Skipping batch and continuing...")
            continue

    print(f"✅ Indexing complete. Total documents in store: {document_store.count_documents()}")

def get_keywords_from_vibe(vibe_text: str) -> str:
    """Takes a vibe/abstract query and returns concrete search keywords."""
    if not GOOGLE_API_KEY:
        return vibe_text

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are a fashion expert and stylist for Myntra. A user is searching for an outfit based on a "vibe".
        Your task is to convert their abstract query into a comma-separated list of 7-10 diverse and concrete search keywords.
        Crucially, only include clothing items like tops, bottoms, dresses, and jackets. **Do not include accessories, bags, jewelry, or footwear.**
        Focus on clothing types, styles, colors, and patterns. Do not include explanations.

        Vibe: "outfits for a rainy day in Bengaluru"
        Keywords: "waterproof jacket, dark wash jeans, cozy sweater, trench coat, casual trousers, full-sleeve top, relaxed-fit pants"

        Vibe: "what to wear to a sangeet"
        Keywords: "lehenga, sharara, anarkali suit, vibrant colors, intricate embroidery, festive blouse, indian ethnic wear, embroidered kurta"
        
        Vibe: "outfit for a coffee date in Mumbai"
        Keywords: "casual dress, pink dress, white top, denim skirt, A-line skirt, flared jeans, crop top, brunch outfit"

        Vibe: "bohemian festival look"
        Keywords: "flowy maxi dress, fringe vest, crochet top, wide-leg pants, paisley print blouse, peasant top, bohemian skirt"

        Vibe: "{vibe_text}"
        Keywords:
        """
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return vibe_text
    
def search_products(query_text: Optional[str], query_image_path: Optional[Path], top_k: int = 10) -> List:
    text_embedding, image_embedding = None, None
    processed_text = query_text

    # --- 1. Check for "vibe" and process with Gemini if needed ---
    if query_text and len(query_text.split()) > 3: 
        print(f"Vibe detected. Getting keywords for: '{query_text}'")
        processed_text = get_keywords_from_vibe(query_text)
        print(f"Using generated keywords: '{processed_text}'")

    # --- 2. Create text embedding if text is provided ---
    if processed_text:
        text_embedding = text_embedder.run(text=processed_text)["embedding"]

    # --- 3. Create image embedding if image is provided ---
    if query_image_path:
        image_doc = Document(meta={"file_path": str(query_image_path.resolve())})
        image_embedding = image_embedder.run(documents=[image_doc])["documents"][0].embedding

    # --- 4. Combine embeddings ---
    if text_embedding is not None and image_embedding is not None:
        final_embedding = np.average([text_embedding, image_embedding], axis=0).tolist()
    elif text_embedding is not None:
        final_embedding = text_embedding
    elif image_embedding is not None:
        final_embedding = image_embedding
    else:
        return []

    # --- 5. Run the retriever and format results (No changes here) ---
    result = retriever.run(query_embedding=final_embedding, top_k=top_k)
    formatted_results = []
    for doc in result["documents"]:
        image_path = Path(doc.meta.get("file_path", ""))
        formatted_results.append({
            "product_id": doc.meta.get("p_id"),
            "product_name": doc.meta.get("name"),
            "brand": doc.meta.get("brand"),
            "description": doc.content,
            "score": doc.score,
            "image_url": f"/static/{image_path.name}"
        })
    return formatted_results

# ======================================================================================
# --- 4. FASTAPI APPLICATION ---
# ======================================================================================
app = FastAPI(title="Myntra Visual Search API")
app.mount("/static", StaticFiles(directory=IMAGE_DIR), name="static")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# MODIFIED: The startup logic is now smarter
@app.on_event("startup")
def on_startup():
    print("🚀 Server starting up...")
    index_products_from_csv() 
    print("🔥 Warming up models...")
    text_embedder.warm_up()
    image_embedder.warm_up()
    print("✅ Backend is ready to accept requests!")


# The search and health endpoints remain the same
@app.post("/search")
async def handle_search(
    query_text: str = Form(""),
    top_k: int = Form(10),
    query_image: Optional[UploadFile] = File(None)
):
    print(f"--- Backend received: query_text='{query_text}' ---")
    temp_image_path = None
    try:
        if query_image and query_image.filename:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
                tmp.write(await query_image.read())
                temp_image_path = Path(tmp.name)
        if not query_text and not temp_image_path:
             raise HTTPException(status_code=400, detail="Please provide a text query or an image.")
        results = search_products(query_text=query_text, query_image_path=temp_image_path, top_k=top_k)
        for result in results:
            result["image_url"] = f"http://127.0.0.1:8000{result['image_url']}"
        return {"results": results}
    finally:
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)

@app.get("/health")
def health_check():
    return {"status": "healthy", "document_count": document_store.count_documents()}