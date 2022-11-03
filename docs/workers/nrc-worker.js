importScripts("../lexicons/nrc_en.min.js");

const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

const removePunctuation = (string) => {
  return string.replace(regex, "");
};

const loadRawText = (text) => {
  const str = removePunctuation(text).toLowerCase();
  const arr = str.split(" ");

  return arr;
};

const buildWordEffect = (words) => {
  const emotionalEffect = {
    fear: 0,
    anger: 0,
    anticipation: 0,
    trust: 0,
    surprise: 0,
    positive: 0,
    negative: 0,
    sadness: 0,
    disgust: 0,
    joy: 0,
  };

  for (let word of words) {
    if (nrc[word] == undefined) continue;
    else {
      let emotions = nrc[word];
      //    console.log(emotions);
      for (let emotion of emotions) {
        // console.log(emotion);
        emotionalEffect[emotion] = emotionalEffect[emotion] + 1;
      }
    }
  }

  return emotionalEffect;
};

onmessage = function (e) {
  const text = e.data;
  const input = loadRawText(text);
  const result = buildWordEffect(input);
  
  postMessage(result);
};
