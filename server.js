const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fallback GTA Quotes in French if no LLM is configured
const fallbackQuotes = [
    "I'll have two number 9s, a number 9 large... ah non, on parle français ici. J'veux deux numéro 9, un numéro 9 large, un numéro 6 avec extra sauce, un numéro 7, deux numéro 45 dont un avec du fromage, et un grand soda.",
    "Tout ce que tu avais à faire, c'était de suivre ce putain de train, CJ !",
    "Grove Street, c'est ma maison. Du moins, ça l'était avant que je foute tout en l'air.",
    "Tu es entré dans le mauvais quartier, mec !",
    "Ici c'est Los Santos, on ne rigole pas avec le respect.",
    "T'as oublié d'où tu viens, gamin ?",
    "Le C.R.A.S.H. te surveille. Fais attention à tes arrières.",
    "Va te faire couper les cheveux, ton style est complètement pété.",
    "Je suis The Truth, mec. La vérité est ailleurs... et dans le désert.",
    "Fais chauffer les suspensions hydrauliques, on va faire un tour."
];

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message manquant" });
    }

    try {
        // Optionnel : Intégration LLM si OPENAI_API_KEY est fournie
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: "Tu es un habitant rebelle et sarcastique de Los Santos dans GTA San Andreas (Grove Street). Tu parles avec de l'argot français de rue. Tu es toujours immergé dans l'univers du jeu." },
                        { role: "user", content: message }
                    ]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                return res.json({ reply: data.choices[0].message.content });
            }
        }

        // Si pas d'API LLM, répondre avec une phrase aléatoire
        const randomReply = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        
        // Simuler un léger temps de frappe
        setTimeout(() => {
            res.json({ reply: randomReply });
        }, 1000 + Math.random() * 1000);

    } catch (error) {
        console.error("Erreur Chatbot:", error);
        res.status(500).json({ error: "Le réseau de Los Santos est planté." });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'gta-chatbot' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`====================================================`);
    console.log(`[GTA CHATBOT] Serveur actif sur http://${HOST}:${PORT}`);
    if (process.env.OPENAI_API_KEY) {
        console.log(`[GTA CHATBOT] LLM Actif (Clé OpenAI détectée)`);
    } else {
        console.log(`[GTA CHATBOT] Mode Fallback (Citations aléatoires)`);
    }
    console.log(`====================================================`);
});
