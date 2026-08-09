"""
CineGenie AI - RAG Service
Handles document chunking, embedding, ChromaDB storage, and retrieval
"""
import os
import uuid
import asyncio
from typing import List, Optional, Dict
from pathlib import Path

from app.core.config import settings


class RAGService:
    """
    Retrieval-Augmented Generation service.
    Uses ChromaDB for vector storage and OpenAI for embeddings.
    Falls back gracefully if ChromaDB is unavailable.
    """

    def __init__(self):
        self.chroma_available = False
        self._init_chroma()

    def _init_chroma(self):
        """Initialize ChromaDB client."""
        try:
            import chromadb
            self.chroma_client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIR
            )
            self.chroma_available = True
            print("[RAG] ChromaDB initialized successfully")
        except Exception as e:
            print(f"[RAG] ChromaDB not available: {e}. RAG features will be limited.")
            self.chroma_available = False

    def _get_collection(self, user_id: int):
        """Get or create a ChromaDB collection for a user."""
        if not self.chroma_available:
            return None
        collection_name = f"user_{user_id}_docs"
        return self.chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"user_id": str(user_id)}
        )

    async def process_document(
        self,
        file_path: str,
        document_id: int,
        user_id: int,
        file_type: str,
    ) -> Dict:
        """Process a document: chunk, embed, and store in ChromaDB."""
        # Extract text from file
        text = await self._extract_text(file_path, file_type)
        if not text:
            return {"success": False, "error": "Could not extract text", "chunks": 0}

        # Chunk the text
        chunks = self._chunk_text(text)

        if not self.chroma_available:
            return {"success": True, "chunks": len(chunks), "warning": "ChromaDB not available"}

        try:
            collection = self._get_collection(user_id)

            # Prepare data for ChromaDB
            ids = [f"doc_{document_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"document_id": str(document_id), "chunk_index": i} for i in range(len(chunks))]

            # Add to collection (ChromaDB handles embeddings internally if using sentence-transformers)
            collection.add(
                documents=chunks,
                ids=ids,
                metadatas=metadatas,
            )

            return {"success": True, "chunks": len(chunks)}

        except Exception as e:
            return {"success": False, "error": str(e), "chunks": 0}

    async def query(
        self,
        query: str,
        user_id: int,
        document_ids: Optional[List[int]] = None,
        n_results: int = 5,
    ) -> Dict:
        """Query the knowledge base and get relevant context."""
        if not self.chroma_available:
            return {
                "answer": "Knowledge base is not available. Please ensure ChromaDB is running.",
                "sources": [],
                "context": "",
            }

        try:
            collection = self._get_collection(user_id)

            # Build where clause
            where = None
            if document_ids:
                if len(document_ids) == 1:
                    where = {"document_id": str(document_ids[0])}
                else:
                    where = {"document_id": {"$in": [str(d) for d in document_ids]}}

            results = collection.query(
                query_texts=[query],
                n_results=min(n_results, 10),
                where=where,
            )

            if not results["documents"] or not results["documents"][0]:
                return {
                    "answer": "No relevant information found in your knowledge base.",
                    "sources": [],
                    "context": "",
                }

            # Build context from retrieved chunks
            context_chunks = results["documents"][0]
            context = "\n\n---\n\n".join(context_chunks)

            # Generate answer using OpenAI
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

            response = await client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a knowledgeable assistant. Answer questions based on the provided context from the user's knowledge base. Always cite specific information from the context. If the context doesn't contain relevant information, say so clearly.",
                    },
                    {
                        "role": "user",
                        "content": f"Context from knowledge base:\n{context}\n\nQuestion: {query}",
                    }
                ],
                max_tokens=2000,
            )

            return {
                "answer": response.choices[0].message.content,
                "sources": results["metadatas"][0] if results["metadatas"] else [],
                "context": context[:500] + "..." if len(context) > 500 else context,
            }

        except Exception as e:
            return {
                "answer": f"Error querying knowledge base: {str(e)}",
                "sources": [],
                "context": "",
            }

    async def _extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from various file types."""
        try:
            if file_type == "pdf":
                return await self._extract_pdf(file_path)
            elif file_type in ["docx", "doc"]:
                return await self._extract_docx(file_path)
            elif file_type == "txt":
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
            else:
                # Try reading as text
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    return f.read()
        except Exception as e:
            print(f"[RAG] Error extracting text: {e}")
            return ""

    async def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF."""
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"[RAG] PDF extraction error: {e}")
            return ""

    async def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX."""
        try:
            from docx import Document
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            print(f"[RAG] DOCX extraction error: {e}")
            return ""

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks."""
        if not text:
            return []

        chunks = []
        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size

            # Try to break at a sentence boundary
            if end < text_length:
                for delimiter in [". ", "! ", "? ", "\n\n", "\n"]:
                    boundary = text.rfind(delimiter, start, end)
                    if boundary != -1:
                        end = boundary + len(delimiter)
                        break

            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)

            start = end - overlap

        return chunks

    async def delete_document(self, document_id: int, user_id: int):
        """Delete all chunks for a document from ChromaDB."""
        if not self.chroma_available:
            return

        try:
            collection = self._get_collection(user_id)
            # Get all IDs for this document
            results = collection.get(where={"document_id": str(document_id)})
            if results["ids"]:
                collection.delete(ids=results["ids"])
        except Exception as e:
            print(f"[RAG] Error deleting document: {e}")
