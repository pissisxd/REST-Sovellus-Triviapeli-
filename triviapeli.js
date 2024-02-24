const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

//kysymykset ja vastaukset
const triviaQuestions = loadQuestionsFromFile('kysymykset.json');
// Juurireitti, joka antaa tervetuloa-viestin
app.get('/', (req, res) => {
  res.send('Tervetuloa trivia-peliin! Käytä /triviapeli/kysymys saadaksesi kysymyksen.');
});
// Apufunktio trivia-kysymysten lataamiseksi tiedostosta
function loadQuestionsFromFile(filename) {
  try {
    const data = fs.readFileSync(filename);
    return JSON.parse(data);
  } catch (error) {
    console.error('Virhe luettaessa kysymyksiä tiedostosta:', error.message);
    return [];
  }
}

// GET /triviapeli/kysymys
app.get('/triviapeli/kysymys', (req, res) => {
  const randomQuestion = getRandomQuestion();
  res.json({ question: randomQuestion.question });
});

// POST /triviapeli/vastaus/:kysymysId
app.post('/triviapeli/vastaus/:kysymysId', (req, res) => {
  const kysymysId = parseInt(req.params.kysymysId);
  
  if (!req.body || !req.body.kayttajanVastaus) {
    res.status(400).json({ error: 'Käyttäjän vastaus puuttuu' });
    return;
  }

  const kayttajanVastaus = req.body.kayttajanVastaus.toLowerCase();

  const question = triviaQuestions.find(q => q.id === kysymysId);

  if (!question) {
    res.status(404).json({ error: 'Kysymystä ei löytynyt' });
    return;
  }

  const isCorrect = question.answer.toLowerCase() === kayttajanVastaus;
  res.json({ isCorrect, correctAnswer: question.answer });
});

// Apufunktio satunnaisen kysymyksen hakemiseksi
function getRandomQuestion() {
  const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
  return triviaQuestions[randomIndex];
}

// Käynnistä Express-palvelin
const port = 3000;
app.listen(port, () => {
  console.log(`Palvelin käynnissä osoitteessa http://localhost:${port}`);
});