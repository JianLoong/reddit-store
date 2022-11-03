importScripts("../lexicons/nrcvad_en.min.js");
importScripts("../util/lemmas_en.js");

const regex = /[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~]/g;

const removePunctuation = (string) => {
    return string.replace(regex, "").toLowerCase();
};

const loadRawText = (text) => {
    const str = removePunctuation(text);
    const arr = str.split(" ");

    return arr;
};

let buildFreq = (repliesText) => {
    if (repliesText === undefined) return 0;
    let words = loadRawText(repliesText);
    
    let result = {
        "valence": 0,
        "dominance": 0,
        "arousal": 0
    }
    for (let word of words) {

        if (word in nrcvad) {
            result["valence"] += nrcvad[word][0];
            result["dominance"] += nrcvad[word][1];
            result["arousal"] += nrcvad[word][2];
        }

    }

    result["valence"] = result["valence"].toPrecision(4);
    result["dominance"] = result["dominance"].toPrecision(4);
    result["arousal"] = result["arousal"].toPrecision(4);

    return result;
};

onmessage = function (e) {
    const intensity = buildFreq(e.data);
    postMessage(intensity);
};
