# ======================================================================================
# --- 0. SETUP AND IMPORTS ---
# ======================================================================================
import os
from pathlib import Path
from typing import List, Optional
import tempfile
import numpy as np
import pandas as pd
from tqdm import tqdm

# --- Haystack Imports ---
from haystack.core.pipeline import Pipeline
from haystack.dataclasses import Document, ByteStream
from haystack.components.embedders.image import SentenceTransformersDocumentImageEmbedder
from haystack.components.embedders.sentence_transformers_text_embedder import SentenceTransformersTextEmbedder
from haystack.components.retrievers.in_memory import InMemoryEmbeddingRetriever
from haystack.document_stores.in_memory import InMemoryDocumentStore
from haystack.components.writers import DocumentWriter

# --- FastAPI Imports ---
from fastapi import FastAPI, Form, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# ======================================================================================
# --- 1. CONFIGURATION & GLOBAL INITIALIZATION ---
# ======================================================================================
IMAGE_DIR = Path("data") / "Images"
CSV_FILE = Path("data") / "products.csv"
MODEL_NAME = "sentence-transformers/clip-ViT-L-14"
MAX_PRODUCTS_TO_INDEX = 1000

document_store = InMemoryDocumentStore(embedding_similarity_function="cosine")
text_embedder = SentenceTransformersTextEmbedder(model=MODEL_NAME)
image_embedder = SentenceTransformersDocumentImageEmbedder(model=MODEL_NAME)
retriever = InMemoryEmbeddingRetriever(document_store=document_store)

# ======================================================================================
# --- 2. OFFLINE INDEXING LOGIC ---
# ======================================================================================
def index_products_from_csv():
    print("🚀 Starting product indexing process from CSV...")

    if document_store.count_documents() > 0:
        print(f"✅ Found {document_store.count_documents()} documents already indexed. Skipping.")
        return

    df = pd.read_csv(CSV_FILE)
    df = df.head(MAX_PRODUCTS_TO_INDEX)
    df = df.where(pd.notnull(df), None)

    documents_to_index = []
    print(f"🖼️ Preparing {len(df)} products for indexing...")

    for _, row in tqdm(df.iterrows(), total=df.shape[0], desc="Creating Documents"):
        # USE p_id to link to the images we just downloaded
        product_id = row.get('p_id')
        if not product_id:
            continue
        
        image_path = IMAGE_DIR / f"{product_id}.jpg"
        if not image_path.exists():
            continue
        
        product_description = f"{row.get('name', '')} by {row.get('brand', '')}. Color: {row.get('colour', '')}. Description: {row.get('description', '')}"
        
        doc = Document(
            content=product_description, 
            meta={
                "p_id": product_id,
                "name": row.get('name'),
                "brand": row.get('brand'),
                "file_path": str(image_path.resolve())
            }
        )
        documents_to_index.append(doc)

    if not documents_to_index:
        print("⚠️ No valid products with matching images found. Indexing skipped.")
        return

    indexing_pipeline = Pipeline()
    indexing_pipeline.add_component("embedder", image_embedder)
    indexing_pipeline.add_component("writer", DocumentWriter(document_store=document_store))
    indexing_pipeline.connect("embedder.documents", "writer.documents")

    print(f"🧠 Generating embeddings for {len(documents_to_index)} products...")
    indexing_pipeline.run({"embedder": {"documents": documents_to_index}})
    print(f"✅ Successfully indexed {document_store.count_documents()} products.")

# ======================================================================================
# --- 3. ONLINE QUERYING LOGIC ---
# ======================================================================================
def search_products(query_text: Optional[str], query_image_path: Optional[Path], top_k: int = 10) -> List:
    text_embedding, image_embedding = None, None

    if query_text:
        text_embedding = text_embedder.run(text=query_text)["embedding"]

    if query_image_path:
        image_doc = Document(meta={"file_path": str(query_image_path.resolve())})
        image_embedding = image_embedder.run(documents=[image_doc])["documents"][0].embedding

    if text_embedding is not None and image_embedding is not None:
        final_embedding = np.average([text_embedding, image_embedding], axis=0).tolist()
    elif text_embedding is not None:
        final_embedding = text_embedding
    elif image_embedding is not None:
        final_embedding = image_embedding
    else:
        return []

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

@app.on_event("startup")
def on_startup():
    print("🚀 Server starting up...")
    index_products_from_csv()
    print("🔥 Warming up models...")
    text_embedder.warm_up()
    image_embedder.warm_up()
    print("✅ Backend is ready to accept requests!")

@app.post("/search")
async def handle_search(
    query_text: str = Form(""),
    top_k: int = Form(10),
    query_image: Optional[UploadFile] = File(None)
):
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