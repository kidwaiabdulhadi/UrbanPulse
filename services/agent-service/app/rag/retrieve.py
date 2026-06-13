from typing import List, Dict
import os

# We would import Chroma and OpenAIEmbeddings here, but we will mock the retrieval
# since the LLM key is missing in this test environment.
from app.rag.ingest import MOCK_DOCUMENTS

def retrieve_context(query: str, k: int = 2) -> str:
    """
    Performs similarity search against ChromaDB and formats the result with citations.
    """
    # In production:
    # embeddings = OpenAIEmbeddings()
    # vectorstore = Chroma(persist_directory="./chroma_data", embedding_function=embeddings)
    # docs = vectorstore.similarity_search(query, k=k)
    
    # Mocking semantic search based on keyword matching for the demo
    query_lower = query.lower()
    results = []
    for doc in MOCK_DOCUMENTS:
        if "rain" in query_lower and "Weather" in doc["source"]:
            results.append(doc)
        elif "crowd" in query_lower and "Capacity" in doc["source"]:
            results.append(doc)
        elif "delay" in query_lower and "Incident" in doc["source"]:
            results.append(doc)
            
    if not results:
        results = MOCK_DOCUMENTS[:k]
        
    formatted_context = []
    for doc in results:
        formatted_context.append(
            f"Fact: {doc['content']}\n"
            f"Citation: [{doc['source']}, Page {doc['page']}]"
        )
        
    return "\n\n".join(formatted_context)
