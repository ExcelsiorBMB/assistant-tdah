import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Le frontend appelle cette route au lieu de la capacité "sample" de claude.ai,
// qui n'existe que sur les pages publiées sur claude.ai.
app.post('/api/suggest', async (req, res) => {
  const { title, previous = [] } = req.body || {};

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'title requis' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY manquante dans .env' });
  }

  const avoidClause = previous.length
    ? `Tu as déjà proposé ces sous-étapes, ne les répète pas et propose des alternatives différentes : ${previous
        .map((s) => `"${s}"`)
        .join(', ')}. `
    : '';

  const prompt =
    `Tu aides une personne avec un TDAH à démarrer une tâche floue ou intimidante. ` +
    `Décompose la tâche suivante en 2 à 3 premières sous-étapes concrètes. ` +
    `Chaque sous-étape doit être la plus simple, rapide et engageante possible ` +
    `(moins de 5 minutes idéalement, jamais plus de 10), formulée de façon attrayante et sans ambiguïté. ` +
    avoidClause +
    `Réponds uniquement avec un JSON de la forme {"steps": ["...", "..."]}, sans aucun autre texte.\n\n` +
    `Tâche : "${title}"`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Erreur API Anthropic:', response.status, errText);
      return res.status(502).json({ error: 'anthropic_api_error' });
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === 'text');
    let parsed = { steps: [] };
    try {
      parsed = JSON.parse((textBlock?.text || '{}').trim());
    } catch {
      // Le modèle n'a pas renvoyé un JSON strictement valide : on renvoie une liste vide,
      // le frontend affiche alors le message "suggestion indisponible".
    }

    const steps = Array.isArray(parsed.steps) ? parsed.steps.slice(0, 3) : [];
    res.json({ steps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'suggestion_failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Assistant TDAH lancé sur http://localhost:${PORT}`);
});
