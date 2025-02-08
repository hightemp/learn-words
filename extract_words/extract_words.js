const pdfParse = require('pdf-parse');
const fs = require('fs');

async function convertPdfToJson(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    const text = data.text;
    const lines = text.split('\n');
    const words = [];

    for (let line of lines) {
      line = line.trim();
      if (line === '' || line.includes('The Oxford 3000™') || line.includes('The Oxford 3000 is the list of the 3000 most important words to learn in English, from A1 to B2 level.')) {
        continue; 
      }

      const parts = line.split(' ');
      if (parts.length >= 3) {
          let word = parts[0];
          let type = '';
          let level = '';
          for (let i = 1; i < parts.length; i++) {
            if (parts[i].match(/^[A-Z]{1,2}\d{1}$/)) {
              level = parts[i];
              type = parts[i-1];
              break;
            }
          }

          if (type == 'n.,' || type == 'v.,' || type == 'adj.,' || type == 'adv.,' || type == 'prep.,' || type == 'conj.,' || type == 'pron.,' || type == 'det.,' || type == 'exclam.,' || type == 'auxiliary') {
            type = type.slice(0,-2);
          }
          
          if (type == 'n.') {
              type = 'noun';
          } else if (type == 'v.') {
              type = 'verb';
          } else if (type == 'adj.') {
              type = 'adjective';
          } else if (type == 'adv.') {
              type = 'adverb';
          } else if (type == 'prep.') {
              type = 'preposition';
          } else if (type == 'conj.') {
              type = 'conjunction';
          } else if (type == 'pron.') {
              type = 'pronoun';
          } else if (type == 'det.') {
              type = 'determiner';
          } else if (type == 'exclam.') {
              type = 'exclamation';
          } else if (type == 'auxiliary') {
              type = 'auxiliary verb';
          }
          words.push({ word, type, level });
      }
    }

    const jsonData = JSON.stringify(words, null, 2);
    return jsonData;
  } catch (error) {
    console.error('Ошибка при обработке PDF:', error);
    return null;
  }
}

const pdfFilePath = './tmp/The_Oxford_3000.pdf'; 
convertPdfToJson(pdfFilePath)
  .then(jsonData => {
    if (jsonData) {
      console.log(jsonData);
      fs.writeFileSync('The_Oxford_3000.json', jsonData);
    }
  });