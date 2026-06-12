# Authentification à Deux Facteurs (MFA) - TOTP

## Description

Implémentation complète d'une authentification à deux facteurs (2FA) utilisant TOTP (Time-based One-Time Password) pour sécuriser l'accès au chatbot. Les utilisateurs peuvent configurer une application d'authentification (Google Authenticator, Authy, etc.) pour générer des codes temporaires.

## Fonctionnalités

- **Configuration TOTP**: Génération d'un secret unique et d'un code QR pour chaque utilisateur
- **Vérification TOTP**: Validation des codes à 6 chiffres générés par l'application utilisateur
- **Contournement optionnel**: Les utilisateurs peuvent choisir de passer l'étape MFA (pour accès direct au chat)
- **Flux automatique**: Détection automatique si l'utilisateur a déjà configuré le MFA
- **Intégration JWT**: Émission des tokens d'accès et de rafraîchissement après vérification réussie

## Backend

### Nouvelles Routes API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/mfa/enroll` | Génère un nouveau secret TOTP et un code QR pour l'utilisateur |
| POST | `/mfa/verify` | Vérifie un code TOTP et émet les tokens JWT si valide |
| POST | `/mfa/skip` | Permet à l'utilisateur de passer la configuration MFA |
| GET | `/mfa/status/{user_id}` | Vérifie si l'utilisateur a un MFA configuré et vérifié |

### Modifications Existantes

- **`POST /auth/login`**: Retourne maintenant `requires_mfa`, `user_id`, `has_mfa`, `mfa_verified` si le MFA est requis
- **`router.py`**: Ajout de l'inclusion du routeur MFA

### Nouvelle Table de Base de Données

```sql
mfa_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    secret TEXT NOT NULL,  -- Secret base32 pour TOTP
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)
```

### Dépendances Ajoutées

- `pyotp`: Génération et vérification des codes TOTP
- `qrcode`: Génération des codes QR pour la configuration

## Frontend

### Nouvelles Pages

- **`/login/mfa`**: Page dédiée à la configuration et vérification du MFA
  - Mode configuration: Affiche le code QR et le secret pour les nouvelles configurations
  - Mode vérification: Demande un code TOTP pour les utilisateurs existants
  - Option de contournement: Bouton "Passer" pour les utilisateurs qui ne veulent pas configurer le MFA

### Modifications Existantes

- **`auth.js`**: `loginAction` redirige vers `/login/mfa` lorsque `requires_mfa` est vrai

### Flux Utilisateur

```
1. Utilisateur se connecte via /login
   ↓
2. Backend vérifie si MFA est configuré
   ↓
   ├── Si MFA configuré ET vérifié → Émet tokens, redirige vers /chat
   ↓
   ├── Si MFA configuré mais NON vérifié → Redirige vers /login/mfa?has_mfa=true&mfa_verified=false
   ↓
   └── Si PAS de MFA → Redirige vers /login/mfa?has_mfa=false
          ↓
          ├── Utilisateur scanne QR code
          ↓
          ├── Entrez premier code TOTP
          ↓
          ├── Vérification réussie → Émet tokens, redirige vers /chat
          ↓
          └── Ou clique sur "Passer" → Émet tokens, redirige vers /chat
```

## Composants Réutilisés

- `AuthCard`: Container pour la page MFA
- `Logo`: Affichage du logo
- `FormInput`: Champ pour le code TOTP
- `FormButton`: Boutons d'action
- `ErrorAlert`: Affichage des erreurs
- `LoadingIndicator`: Indicateur de chargement

## Sécurité

- Les secrets TOTP sont stockés en base de données avec le user_id associé
- Chaque secret est unique par utilisateur
- Les codes TOTP ont une validité de 30 secondes (standard)
- L'option de contournement (skip) permet un accès sans MFA mais reste sécurisée par le système JWT existant
- La vérification du MFA se fait côté serveur uniquement

## Configuration Requise

Aucune configuration supplémentaire n'est nécessaire côté utilisateur. Le système fonctionne avec:
- Les dépendances Python déjà installées (`pip install pyotp qrcode`)
- La table `mfa_secrets` sera créée automatiquement par Supabase (si l'init DB est configuré)

## Exemple d'Utilisation

### Enrollment
```bash
curl -X POST http://localhost:8000/mfa/enroll \
  -H "Content-Type: application/json" \
  -d '{"user_id": "123e4567-e89b-12d3-a456-426614174000"}'
```

Réponse:
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "uri": "otpauth://totp/LocalChatbot:user%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=LocalChatbot",
  "qr_code": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Vérification
```bash
curl -X POST http://localhost:8000/mfa/verify \
  -H "Content-Type: application/json" \
  -d '{"user_id": "123e4567-e89b-12d3-a456-426614174000", "code": "123456"}'
```

Réponse (si valide):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```
