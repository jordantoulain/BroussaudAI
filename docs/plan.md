# Plan de Développement - Projet Broussaud AI (Stage BTS SIO)

**Projet Pédagogique BTS SIO - Option SLAM**
**Lycée Suzanne Valadon, Limoges**
**Entreprise Broussaud**

---

## 🎯 Roadmap Pédagogique

### Calendrier Global

| Période | Phase | Objectifs Pédagogiques | Livrables | Compétences Validées |
|---------|-------|------------------------|-----------|----------------------|
| Semaines 1-2 | **Analyse & Conception** | Comprendre les besoins, concevoir la solution | Cahier des charges, MCD/MPD, Roadmap | C1.1, C4.1 |
| Semaines 3-7 | **Développement Backend** | Implémenter le backend complet | API RESTful, Authentification, RAG | C1.2, C1.3, C2.2, C2.3 |
| Semaines 8-10 | **Développement Frontend** | Créer l'interface utilisateur | Composants React, Pages, UI/UX | C1.2, C1.3 |
| Semaines 11-12 | **Intégration & Tests** | Intégrer et tester l'application | Application testée, Optimisations | C1.3, C4.1 |
| Semaines 13-14 | **Sécurité & Déploiement** | Sécuriser et déployer | Application sécurisée, Docker | C2.1, C2.2, C2.3 |
| Semaine 15 | **Documentation & Présentation** | Finaliser et présenter | Documentation, Soutenance | Toutes |

---

## 🚀 Roadmap des Features

### ✅ Features Implémentées (100%)

| Statut | Priorité | Feature | Description | Compétences | Phase |
|--------|----------|---------|-------------|-------------|-------|
| ✅ | **Critique** | Authentification JWT | Login, Register, Logout, Refresh Token, Gestion des rôles | C1.2, C2.3 | Backend |
| ✅ | **Critique** | Chat RAG | Chat avec IA, classification automatique, contextes | C1.2, C1.3 | Backend/Frontend |
| ✅ | **Critique** | Responsive Design | Sidebar mobile, messages pleine largeur, adaptatif | C1.2, C1.3 | Frontend |
| ✅ | **Haute** | Gestion conversations | CRUD conversations, historique, épinglage/désépinglage, archives | C1.2, C1.3, C2.2 | Backend/Frontend |
| ✅ | **Haute** | Admin Panel | Interface administration avec protection par rôle (ADMIN/USER) | C1.2, C2.3 | Backend/Frontend |
| ✅ | **Haute** | MFA TOTP | Authentification à deux facteurs complète | C2.3 | Backend/Frontend |
| ✅ | **Moyenne** | Gestion des documents | Upload multi-formats, indexation vectorielle, administration | C1.2, C1.3 | Backend/Frontend |
| ✅ | **Moyenne** | Serveur MCP | FastMCP + Supabase (tools: stats, hello_world) | C1.2, C1.3 | Backend |
| ✅ | **Moyenne** | Statistiques IA | Dashboard admin avec MiniChart, suivi métriques | C1.2, C1.3 | Backend/Frontend |
| ✅ | **Moyenne** | Génération PDF | Export des conversations en PDF | C1.2 | Backend |
| ✅ | **Moyenne** | Configuration LLM | Sélection dynamique des modèles (Gemini, Mistral, Ollama) via interface admin | C1.2, C1.3 | Backend/Frontend |

---

## 📋 Tâches Techniques par Phase

### Phase 1: Analyse & Conception (Semaines 1-2)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Analyse des besoins | Comprendre le contexte entreprise Broussaud | C1.1 | ⭐⭐ |
| ✅ | **Critique** | Rédaction cahier des charges | Document fonctionnel et technique | C1.1, SA1 | ⭐⭐ |
| ✅ | **Haute** | Conception architecture | Schéma technique global | C1.1, C4.1 | ⭐⭐⭐ |
| ✅ | **Haute** | Modélisation base de données | MCD, MPD, schéma physique | C1.1, SA5 | ⭐⭐⭐ |
| ✅ | **Haute** | Choix technologiques | Stack technique (Python, FastAPI, Next.js, Supabase, LlamaIndex) | C1.1 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Planification développement | Roadmap, timeline, estimation | C2.1 | ⭐⭐ |

**Livrables**: Cahier des charges validé, Documentation de conception, Maquettes fonctionnelles

---

### Phase 2: Développement Backend (Semaines 3-7)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Architecture backend | FastAPI + Supabase + Uvicorn | C1.2, C1.3 | ⭐⭐⭐⭐ |
| ✅ | **Critique** | Système d'authentification | JWT, Bcrypt, MFA (TOTP) | C1.2, C2.3 | ⭐⭐⭐⭐ |
| ✅ | **Haute** | Configuration Supabase | Client, initialisation DB, tables | C1.2, C1.3 | ⭐⭐⭐ |
| ✅ | **Haute** | Service RAG | LlamaIndex + Google GenAI (Gemini) | C1.2, C1.3 | ⭐⭐⭐⭐ |
| ✅ | **Haute** | Routes API | 34+ endpoints RESTful | C1.2 | ⭐⭐⭐ |
| ✅ | **Haute** | Gestion conversations | CRUD, soft-delete, épinglage | C1.2, C2.2 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Serveur MCP | FastMCP + outils statistiques | C1.2, C1.3 | ⭐⭐⭐⭐ |
| ✅ | **Moyenne** | Validation des données | Pydantic, Sanitization | C2.2 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Logging | Phoenix pour le debug | C1.2 | ⭐⭐ |
| ⚠️ | **Moyenne** | Rate limiting | Protection contre le brute force | C2.2 | ⭐⭐ |
| ❌ | **Basse** | Tests unitaires | Couverture de code (objectif: 80%) | C4.1 | ⭐⭐ |

**Livrables**: Backend fonctionnel, API testée, Documentation technique backend

---

### Phase 3: Développement Frontend (Semaines 8-10)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Architecture frontend | Next.js 16 + App Router | C1.2, C1.3 | ⭐⭐⭐⭐ |
| ✅ | **Haute** | Composants React | 40+ composants réutilisables | C1.2 | ⭐⭐⭐ |
| ✅ | **Haute** | Pages principales | Chat, Auth, Admin, Archives | C1.2, C1.3 | ⭐⭐⭐ |
| ✅ | **Haute** | Service API | Axios + interceptors JWT | C1.2, C1.3 | ⭐⭐⭐ |
| ✅ | **Haute** | Hooks personnalisés | useChat, useUserInfo, useConversations, etc. | C1.2 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Styling Tailwind | Thème clair, couleurs, animations | C1.2 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Responsive design | Mobile, tablette, desktop | C1.2, C1.3 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Gestion d'état | Context API, Réactivité | C1.2 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Composants UI | Skeleton, Alerts, Charts | C1.2 | ⭐⭐ |
| ❌ | **Basse** | Tests frontend | React Testing Library | C4.1 | ⭐⭐ |

**Livrables**: Frontend complet, Interface utilisateur testée, Documentation frontend

---

### Phase 4: Intégration & Tests (Semaines 11-12)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Intégration frontend-backend | Connexion API, gestion erreurs | C1.3 | ⭐⭐⭐⭐ |
| ✅ | **Haute** | Tests d'intégration | Vérification du flux complet | C1.3, C4.1 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Optimisation performances | Chargement, caching, GPU | C1.3 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Correction bugs | Identification et résolution | C4.1 | ⭐⭐ |
| ⚠️ | **Moyenne** | Tests E2E | Cypress ou Playwright | C4.1 | ⭐⭐⭐ |

**Livrables**: Application intégrée, Tests d'intégration, Application optimisée

---

### Phase 5: Sécurité & Déploiement (Semaines 13-14)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Audit de sécurité | Analyse des vulnérabilités | C2.1, C2.2, C2.3 | ⭐⭐⭐⭐ |
| ✅ | **Haute** | Correction vulnérabilités | 10+ vulnérabilités corrigées | C2.2, C2.3 | ⭐⭐⭐ |
| ✅ | **Haute** | Configuration Docker | Conteneurisation backend | C1.4 | ⭐⭐⭐ |
| ✅ | **Haute** | Documentation déploiement | Procédures et scripts | C1.4 | ⭐⭐ |
| ✅ | **Moyenne** | Hardening | Sécurité renforcée | C2.2, C2.3 | ⭐⭐⭐ |
| ⚠️ | **Moyenne** | Déploiement cloud | Supabase, Vercel | C1.4 | ⭐⭐⭐⭐ |
| ❌ | **Basse** | Monitoring | Suivi des performances | C2.1 | ⭐⭐ |

**Livrables**: Application sécurisée, Configuration Docker, Documentation de déploiement

---

### Phase 6: Documentation & Présentation (Semaine 15)

| Statut | Priorité | Tâche | Description | Compétences | Complexité |
|--------|----------|-------|-------------|-------------|------------|
| ✅ | **Critique** | Documentation technique | Architecture, API, Composants | SA1 | ⭐⭐⭐ |
| ✅ | **Haute** | Documentation utilisateur | Guide d'utilisation, FAQ | SA1 | ⭐⭐ |
| ✅ | **Haute** | Documentation pédagogique | CONTEXTE_PEDAGOGIQUE.md, STAGE_BTS_SIO.md | SA1 | ⭐⭐ |
| ✅ | **Haute** | Préparation soutenance | Présentation, démo, supports | SA1 | ⭐⭐⭐ |
| ✅ | **Moyenne** | Portfolio compétences | Présentation des acquis | Toutes | ⭐⭐ |
| ✅ | **Moyenne** | Rapport de stage | Document complet | SA1 | ⭐⭐⭐ |

**Livrables**: Documentation complète, Présentation orale, Rapport de stage, Portfolio

---

## 📊 Bilan Global

### Statistiques du Projet

| Métrique | Valeur | Objectif | Statut |
|----------|--------|---------|--------|
| **Durée totale** | [X] semaines | 15 semaines | ✅ |
| **Heures investies** | [X] heures | [Y] heures | [✅/⚠️/❌] |
| **Features implémentées** | 25+ | 25 | ✅ |
| **Routes API** | 34+ | 34 | ✅ |
| **Composants React** | 42+ | 42 | ✅ |
| **Tests unitaires** | 0% | 80% | ❌ |
| **Tests d'intégration** | 50% | 100% | ⚠️ |
| **Documentation** | 100% | 100% | ✅ |
| **Sécurité** | 90% | 100% | ⚠️ |

### Compétences Validées

| Compétence | Niveau | Statut | Validation |
|------------|--------|--------|------------|
| **C1.1** | Maîtrisé | ✅ | À confirmer |
| **C1.2** | Avancé | ✅ | À confirmer |
| **C1.3** | Avancé | ✅ | À confirmer |
| **C1.4** | Intermédiaire | ✅ | À confirmer |
| **C2.1** | Intermédiaire | ✅ | À confirmer |
| **C2.2** | Avancé | ✅ | À confirmer |
| **C2.3** | Avancé | ✅ | À confirmer |
| **C4.1** | Intermédiaire | ✅ | À confirmer |

---

## 🎯 Prochaines Étapes (Post-Stage)

### Backlog

| Priorité | Tâche | Description | Complexité |
|----------|-------|-------------|------------|
| **Haute** | Compléter les tests | Tests unitaires et d'intégration (objectif: 80% de couverture) | ⭐⭐⭐ |
| **Haute** | Déploiement en production | Mise en ligne de l'application Broussaud AI | ⭐⭐⭐⭐ |
| **Moyenne** | Implémenter le rate limiting | Protection contre les attaques par brute force | ⭐⭐ |
| **Moyenne** | CSRF protection | Sécurité renforcée | ⭐⭐ |
| **Moyenne** | Améliorer le RAG | Meilleure précision des réponses IA | ⭐⭐⭐ |
| **Moyenne** | Ajouter plus de formats | Support DOCX, PPTX, etc. | ⭐⭐ |
| **Basse** | Internationalisation | Support multilingue | ⭐⭐⭐ |
| **Basse** | Notifications push | Notifications en temps réel | ⭐⭐ |
| **Basse** | Chat vocal | Intégration speech-to-text | ⭐⭐⭐⭐ |

---

## 📚 Ressources et Outils Utilisés

### Technologies Principales

**Backend**:
- Python 3.11+
- FastAPI + Uvicorn
- Supabase (PostgreSQL + Vector Store)
- LlamaIndex + Google GenAI (Gemini)
- PyJWT, Bcrypt, PyOTP, Pydantic

**Frontend**:
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Axios, js-cookie, Lucide React, ApexCharts

**Infrastructure**:
- Docker + Docker Compose
- Git + GitHub
- Supabase Dashboard
- Postman (tests API)

### Méthodologies

- **Gestion de projet**: Méthode Agile (Scrum-like)
- **Développement**: Clean Code, DRY, SOLID
- **Tests**: TDD (à améliorer)
- **Documentation**: Markdown, diagrammes

---

## 🤝 Rôles et Responsabilités

### Étudiant (Vous)
- Développement de l'application
- Rédaction de la documentation
- Tests et validation
- Présentation du projet

### Tuteur Entreprise
- Encadrement technique
- Validation des choix architecturaux
- Support sur les technologies spécifiques
- Intégration dans l'entreprise

### Tuteur Académique
- Suivi pédagogique
- Validation des compétences BTS SIO
- Évaluation des livrables
- Conseils méthodologiques

---

## 📝 Notes et Observations

[À compléter au fur et à mesure du stage]

---

*Plan de développement maintenu dans le cadre du stage BTS SIO*
*Projet Broussaud AI - Lycée Suzanne Valadon & Entreprise Broussaud*
*© 2026 - Tous droits réservés*
