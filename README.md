# "Atypi" — prototype M1

Assistant TDAH : capture rapide de tâches + découpage automatique en sous-étapes
concrètes et rapides (suggéré par l'API Claude).

## Arborescence

```
assistant-tdah/
├── package.json
├── .env.example        # à copier en .env avec votre vraie clé API
├── .gitignore
├── server/
│   └── index.js         # serveur Express : sert le frontend + appelle l'API Claude
└── public/
    └── index.html        # toute l'interface (HTML + CSS + JS, un seul fichier)
```

## Installation

1. Ouvrez ce dossier dans VSCode.
2. Dans le terminal intégré :
   ```bash
   npm install
   ```
3. Copiez `.env.example` en `.env` :
   ```bash
   cp .env.example .env
   ```
4. Ouvrez `.env` et remplacez la valeur par votre vraie clé API Anthropic
   (créée sur [console.anthropic.com](https://console.anthropic.com), section
   "API Keys" — différente de la clé ElevenLabs utilisée pour le projet JARVIS).

## Lancer le projet

```bash
npm start
```

Puis ouvrez **http://localhost:3000** dans votre navigateur.

Pour un redémarrage automatique à chaque modification de fichier pendant le
développement, utilisez plutôt :

```bash
npm run dev
```

## Comment ça marche

- Le frontend (`public/index.html`) ne contient aucune clé API : il appelle
  simplement `/api/suggest` sur votre propre serveur.
- Le serveur (`server/index.js`) reçoit le titre de la tâche, construit le
  prompt, appelle l'API Claude avec votre clé (gardée côté serveur, jamais
  exposée au navigateur), et renvoie 2 à 3 sous-étapes suggérées.
- Aucune donnée n'est persistée pour l'instant (tout est en mémoire dans le
  navigateur) — conforme au jalon M1 de la roadmap. La persistance arrive au
  jalon M2.

## Dépannage rapide

- **"Suggestion indisponible"** : vérifiez que `npm start` tourne toujours
  dans le terminal, et que `ANTHROPIC_API_KEY` dans `.env` est bien une clé
  valide (elle commence par `sk-ant-`).
- **Erreur au démarrage `Cannot find module 'express'`** : relancez
  `npm install`.
