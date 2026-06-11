# Feature: Gestion des Embeddings de Documents

## Objectif : Fournir une interface d'administration pour gérer les documents PDF indexés dans le vector store (vecs.documents_gemini) avec vérification des doublons

## Composants modifiés : 
- [x] `api/app/api/routes/admin.py` (Ajout endpoints GET /admin/documents, DELETE /admin/documents/{filename})
- [x] `api/app/api/routes/ia.py` (Modification POST /ai/embedding pour ADMIN only + vérification doublons)
- [x] `web/src/app/admin/documents/page.jsx` (Nouvelle page de gestion des documents)
- [x] `web/src/components/admin/DocumentUploadForm.jsx` (Nouveau composant formulaire upload PDF)
- [x] `web/src/components/admin/AdminNavigation.jsx` (Ajout lien "Documents")

## Nouveaux composants :
- [x] `web/src/components/shared/ActionAlert.jsx` (ActionError, ActionSuccess - composants réutilisables)

## Dépendances (Registry) : 
- [x] `api/routes/admin.py` (list_documents, delete_document)
- [x] `api/routes/ia.py` (embed - modifiée pour ADMIN only)
- [x] `components/admin/DocumentUploadForm.jsx` (Formulaire upload avec drag & drop)
- [x] `components/shared/ActionAlert.jsx` (ActionError, ActionSuccess)

## Routes/API : 
- `GET /admin/documents` (Backend) - Liste documents regroupés par filename depuis vecs.documents_gemini (ADMIN seulement)
- `DELETE /admin/documents/{filename}` (Backend) - Supprime TOUTES les lignes d'un fichier (un PDF peut avoir plusieurs chunks) (ADMIN seulement)
- `POST /ai/embedding` (Backend) - Upload document PDF/texte, vérifie doublons via metadata.filename (ADMIN seulement)
- `GET /admin/documents` (Frontend) - Page de gestion avec liste, upload, suppression

## Logique technique : 
- **Structure de la table vecs.documents_gemini** : id (UUID), vec (VECTOR(3072)), metadata (JSONB)
- **Chunking** : Un PDF est découpé en plusieurs nodes/chunks par LlamaIndex, chaque chunk est une ligne dans la table
- **Regroupement par filename** : L'API GET /admin/documents regroupe les chunks par metadata.filename pour n'afficher qu'une ligne par fichier
- **Suppression complète** : DELETE /admin/documents/{filename} utilise `metadata->>filename` pour supprimer TOUTES les lignes correspondant à un fichier
- **Vérification doublons** : POST /ai/embedding vérifie si un document avec le même filename existe déjà avant d'indexer
- **Drag & Drop** : DocumentUploadForm.jsx supporte le glisser-déposer avec feedback visuel (border violet, fond violet-50)
- **Validation** : PDF seulement, taille max 50MB
- **Barre de progression** : Upload avec indicateur de progression
- **Notifications réutilisables** : ActionError et ActionSuccess dans /shared/ pour afficher erreurs et succès de manière cohérente

## Spécificités :
- Pas de colonne `created_at` dans vecs.documents_gemini (contrairement à la table initialement documentée)
- Pas de colonne `embedding` dans vecs.documents_gemini, la colonne s'appelle `vec`
- Pas de colonne `content` dans vecs.documents_gemini
- La taille des fichiers n'est pas enregistrée dans metadata (contrairement à la première version)
- Les metadata contiennent : filename, mimetype (optionnel)

## État : [x] Terminée
