import os
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Dummy knowledge base representing transit manuals
MOCK_DOCUMENTS = [
    {
        "content": "In the event of station overcrowding exceeding 90% capacity, operators must immediately dispatch a standby vehicle and trigger REDIRECT_PASSENGERS protocol at the entrance gates to cap entry rates.",
        "source": "Capacity Policy Manual v2.1",
        "page": 4
    },
    {
        "content": "Rainy conditions historically reduce average platform throughput by 18%. Increase frequency of incoming trains by 2 minutes to compensate.",
        "source": "Weather Operating Procedures",
        "page": 12
    },
    {
        "content": "A delayed vehicle incident on the Red Line will cause cascading crowding at transfer hubs. Best practice is to deploy station staff to manage queues.",
        "source": "Incident Response Guidelines",
        "page": 8
    }
]

def ingest_documents(persist_directory: str = "./chroma_data"):
    """
    Ingests raw transit documents into ChromaDB.
    """
    os.makedirs(persist_directory, exist_ok=True)
    
    docs = [
        Document(page_content=d["content"], metadata={"source": d["source"], "page": d["page"]})
        for d in MOCK_DOCUMENTS
    ]
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    splits = text_splitter.split_documents(docs)
    
    # We use a dummy embedding for local dev if OpenAI key isn't set, 
    # but in a real setup we'd use OpenAIEmbeddings(model="text-embedding-3-small")
    try:
        embeddings = OpenAIEmbeddings()
        vectorstore = Chroma.from_documents(documents=splits, embedding=embeddings, persist_directory=persist_directory)
        return vectorstore
    except Exception:
         # Fallback to a local embedding or simply mock the ingest for demonstration
         print("Warning: Skipping actual ingestion due to missing OpenAI key.")
         return None

if __name__ == "__main__":
    ingest_documents()
