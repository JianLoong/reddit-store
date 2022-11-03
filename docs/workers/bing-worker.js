importScripts("../lexicons/bing_en.min.js")

const regex = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;

const removePunctuation = (string) => {
  return string.replace(regex, "").toLowerCase();
};

const loadRawText = (text) => {
  const str = removePunctuation(text);
  const arr = str.split(" ");

  return arr;
};

const buildWordEffect = (words) => {
  const emotionalEffect = {
    positive: 0,
    negative: 0,
  };

  for (let word of words) {
    if (bing[word] == undefined) continue;
    else {
      let emotion = bing[word];
      emotionalEffect[emotion] = emotionalEffect[emotion] + 1;
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