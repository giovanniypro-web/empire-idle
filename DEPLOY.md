# 🚀 Empire Idle - Guide de Déploiement

## Phase 4 Complétée ✅
- **Prestige System Foundation**
- **44 Prestige Upgrades** (6 branches)
- **Extended Progression** (Activities jusqu'à niveau 30)
- **55 Assets** (spending sinks massifs)
- **Multi-condition Gating System**
- **6 CEO Archetypes**

## 🎯 Options de Déploiement (Choisir une)

### **Option 1: Vercel (Recommandé - 5 minutes)**
1. Va sur https://vercel.com/new
2. Clique "Import Project"
3. Colle: `https://github.com/[TON_USERNAME]/empire-idle` (ou upload le dossier)
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Clique "Deploy"

**Résultat:** URL publique genre `https://empire-idle.vercel.app`

---

### **Option 2: Render.com (Super Simple - 3 minutes)**
1. Va sur https://render.com
2. Connecte-toi avec GitHub/Google
3. Clique "New Site"
4. Sélectionne "Static Site"
5. Connecte ton repo GitHub
6. Render détecte automatiquement `render.yaml`
7. Clique "Deploy"

**Résultat:** URL gratuite avec domaine Render

---

### **Option 3: Netlify (Facile - 5 minutes)**
1. Va sur https://app.netlify.com
2. Drag & drop le dossier `dist/` (après `npm run build` local)
3. Ou connecte GitHub repo
4. Netlify construit automatiquement

**Résultat:** URL gratuite genre `https://[name].netlify.app`

---

## 📋 Setup Rapide (Local First)

```bash
# Installer dépendances
npm install

# Builder pour prod
npm run build

# Résultat disponible dans /dist
```

---

## 🔑 Credentials Requises par Plateforme

| Plateforme | Nécessaire | Coût |
|-----------|-----------|------|
| **Vercel** | GitHub/GitLab account | Gratuit |
| **Render** | GitHub/Google account | Gratuit |
| **Netlify** | GitHub/GitLab account | Gratuit |

---

## 📊 Stats du Projet

- **Taille Build:** ~377 KB (105 KB gzipped)
- **Framework:** React 18 + Zustand + Vite
- **Playtime:** 2-3+ heures
- **Features:** Phase 4 complète

---

## ✨ Features Principales

### Meta-Progression
- Prestige Reset System (niveau 25+)
- Career History tracking
- Permanent upgrades across runs

### Gameplay
- 15 Activities (Soda → Civilization)
- 55 Assets (from Scooters to Mega-Yachts)
- 6 CEO Archetypes with unique bonuses
- Multi-condition Gating (level + prestige + missions + stats)

### Content
- 30+ Missions
- 44 Prestige Upgrades (6 branches)
- HR System with employees
- Stock market, departments, talents

---

## 🎮 Try It Now

Le jeu est **100% prêt**. Choisis un déploiement et lance-toi!

**Temps moyen:**
- Setup: 2 minutes
- Déploiement: 3-5 minutes
- URL publique: Reçu!

Bon jeu! 🎯
