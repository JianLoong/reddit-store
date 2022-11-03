const regex = /[!"#$%&'()*+,./:;<=>?@[\]^_`{|}~]/g;

const removePunctuation = (string) => {
    return string.replace(regex, " ").toLowerCase();
};

const loadRawText = (text) => {
    const str = removePunctuation(text);
    const arr = str.toLowerCase().split(" ");

    return arr;
};

let buildFreq = (repliesText) => {
    if (repliesText === undefined) return 0;
    let words = loadRawText(repliesText)
    let counts = {
        yta_count: 0,
        nta_count: 0,
        info_count: 0,
        esh_count: 0,
        nah_count: 0
    }
    for (let word of words) {
        if (word == "yta")
            counts.yta_count = counts.yta_count + 1;
        if (word == "nta")
            counts.nta_count = counts.nta_count + 1;
        if (word == "info")
            counts.info_count = counts.info_count + 1;
        if (word == "esh")
            counts.esh_count = counts.esh_count + 1;
        if (word == "nah")
            counts.nah_count = counts.nah_count + 1;

    }
    return counts;
};

onmessage = function (e) {
    const counts = buildFreq(e.data);
    postMessage(counts);
};
