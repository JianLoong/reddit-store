importScripts("../lexicons/loughran1993-2021_en.js");

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
  const sentiment = {
    negative: 0,
    positive: 0,
    uncertainty: 0,
    litigious: 0,
    strong_modal: 0,
    weak_modal: 0,
    constraining: 0
  };


  // 'negative', 'positive', 'uncertainty', 'litigious', 
  //'strong_modal', 'weak_modal', 'constraining

  for (let word of words) {
    current_word = word.toLowerCase();
    if (loughran[current_word] == undefined) continue;
    else {
      let emotions = loughran[current_word];
      //    console.log(emotions);
      for (let emotion of emotions) {
        // console.log(emotion);
        sentiment[emotion] = sentiment[emotion] + 1;
      }
    }
  }

  return sentiment;
};

onmessage = function (e) {
  const text = e.data;
  const input = loadRawText(text);
  const result = buildWordEffect(input);
  
  postMessage(result);
};
