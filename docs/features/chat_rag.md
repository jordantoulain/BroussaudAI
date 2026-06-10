# Feature : Chat RAG

## Objectif
Permettre aux utilisateurs de discuter avec une IA spécialisée sur l'usine textile Broussaud, avec classification automatique des réponses.

## Composants / Fichiers
- [x] `api/app/api/routes/ia.py` (Routes chat + embedding)
- [x] `api/app/core/llm.py` (Configuration LLM/Embeddings)
- [x] `api/app/services/rag.py` (RAG engine)
- [x] `web/src/app/chat/page.jsx` (Interface chat)
- [x] `web/src/components/chat/` (Composants chat)
- [x] `web/src/hooks/useChat.js` (Gestion état chat)

## Dépendances Internes
- [x] `core/supabase_client.py` (Vector Store)
- [x] `core/supabase_init.py` (Tables conversations, messages)
- [x] `services/api.js` (Client HTTP)

## Routes & API
- `POST /ai/chat` : Chat avec RAG + historique
- `POST /ai/embedding` : Upload document (PDF/text)

## Logique Technique
- **Chat** :
  - Récupération historique (5 derniers messages) → chat_rag avec contexte
  - Classification automatique : label, sub_label, tags
  - Sauvegarde message en DB (conversations, messages)
  - Retourne {context, response, conversation_id, label, sub_label, tags}
- **Embedding** :
  - PDF → PDFReader → Nodes → index.insert_nodes
  - Text → Document → index.insert
- **RAG** :
  - SupabaseVectorStore (documents_gemini, 3072 dim)
  - Google GenAI gemini-3.1-flash-lite (LLM)
  - Google GenAI gemini-embedding-2 (Embeddings)
  - chat_mode="condense_question" avec mémoire historique

## Prompt IA
- **Rôle** : Assistant spécialisé usine textile de chaussettes
- **Tâches** :
  1. Identifier label principal (25 options)
  2. Identifier sous-label pertinent
  3. Générer 1-10 tags descriptifs
  4. Répondre uniquement avec infos du contexte
- **Format sortie** : JSON strict {label, sub_label, tags, answer}

## État
[x] Terminée
