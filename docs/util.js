const makeHTMLFromString = (str) => {
    let text = str;
    parsed = "<p>" + text + "</p>";
    parsed = parsed.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
    parsed = parsed.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
    return parsed;
}

const processNRC = (nrc) => {
    let tableHTML = '<table class="result-table table table-bordered table-striped mb-0">';
    tableHTML += '<thead><tr><th>Emotion</th><th>Raw Emotion Score</th></tr></thead>';
    tableHTML += "<tbody>";
    tableHTML += "<tr><td>" + "Positive" + "</td><td>" + nrc.positive + "</td></tr>";
    tableHTML += "<tr><td>" + "Negative" + "</td><td>" + nrc.negative + "</td></tr>";
    tableHTML += "<tr><td>" + "Fear" + "</td><td>" + nrc.fear + "</td></tr>";
    tableHTML += "<tr><td>" + "Anger" + "</td><td>" + nrc.anger + "</td></tr>";
    tableHTML += "<tr><td>" + "Anticipation" + "</td><td>" + nrc.anticipation + "</td></tr>";
    tableHTML += "<tr><td>" + "Trust" + "</td><td>" + nrc.trust + "</td><tr>";
    tableHTML += "<tr><td>" + "Surprise" + "</td><td>" + nrc.surprise + "</td></tr>";
    tableHTML += "<tr><td>" + "Sadness" + "</td><td>" + nrc.sadness + "</td></tr>";
    tableHTML += "<tr><td>" + "Disgust" + "</td><td>" + nrc.disgust + "</td></tr>";
    tableHTML += "<tr><td>" + "Joy" + "</td><td>" + nrc.joy + "</td></tr>";
    tableHTML += "</tbody></table>"

    htmlString = "<h5 class='card-title'><p class=text-center>" + "Results of NRC Emotion Lexicon Analysis" + "</p></h5>";

    return htmlString + tableHTML;
}

const processAfinn = (score) => {
    let htmlString = "";
    if (score < 0) {
        htmlString = '<div class="alert alert-warning" role="alert">Negative</div>';
    }

    if (score == 0) {
        htmlString = '<div class="alert alert-info" role="alert">Neutral</div>';
    }
    if (score > 0) {
        htmlString = '<div class="alert alert-success" role="alert">Positive</div>';
    }
    let tableHTML = '<table class="result-table table table-bordered table-striped mb-0"><thead><tr><th>Score</th></thead>';
    htmlString += tableHTML + "<tr><td>" + score + "</td></tr></table>";;

    return htmlString;
}

const convertDate = (dateInUTC) => {
    const event = new Date(dateInUTC * 1000);
    displayTime = event.toDateString() + " " + event.toTimeString();
    return displayTime;
}

const buildSubmissions = (submission) => {
    htmlString = "";
    htmlString += "<h1 class='card-title'>" + submission.title + "</h1>";
    htmlString += "<hr>"
    htmlString += "<small>" + convertDate(submission.created_utc) + "</small>";
    htmlString += "<p></p>"
    htmlString += "" + makeHTMLFromString(submission.selftext) + "";

    let link = "https://reddit.com/" + submission.permalink;

    htmlString +=
        "<p>View original post <a href='" + link + "' class='card-link'>here</a></p>";
    htmlString += "<p>Number of replies <strong>" + submission.replies.length + "</strong></p>";
    
    return htmlString;
}

const buildChart = (id, dataArr) => {
    const ctx = document.getElementById(id).getContext("2d");
    const data = {
        labels: [
            "Not the A-hole",
            "You’re the A-hole",
            "Everyone sucks here",
            "No A-holes here",
            "Not Enough Info",
        ],
        datasets: [
            {
                data: dataArr,
                backgroundColor: [
                    "green",
                    "red",
                    "rgb(255, 205, 86)",
                    "rgb(201, 203, 207)",
                    "rgb(54, 162, 235)",
                ],
            },
        ],
    };
    const myChart = new Chart(ctx, {
        type: "pie",
        data: data,
        options: {

        },
    });
};

const makeCloud = (cloudLocation, words) => {
    htmlString = "";
    let cloudId = cloudLocation;
    words = Object.keys(words);
    // let keys = Object.keys(words);
    // let values = Object.values(words);
    // let processedWords = [];

    // let sum = 0;

    // for (let i = 0; i < keys.length; i++) {
    //     processedWords.push({
    //         "text": keys[i],
    //         "size": values[i]
    //     })
    //     sum += values;
    // }

    // This computed width is used to draw the cloud so that the size is right.
    const width = document.getElementById(cloudId).getBoundingClientRect().width;
    const cloudDiv = document.getElementById(cloudId);

    const draw = (words) => {
        d3.select(cloudDiv).append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) { return d.size + "px"; })
            .style("font-family", "Impact")
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    }

    var layout = d3.layout.cloud()
        .size([width, width])
        .words(words.map(function (d) {
            return { text: d, size: 10 + Math.random() * 90 };
        }))
        .padding(5)
        .spiral("rectangular")
        .rotate(function () { return 0; })
        .font("Impact")
        .fontSize(function (d) { return d.size; })
        .on("end", draw);

    layout.start();

}


const createDiv = (indexes) => {
    let htmlString = "";
    for (const index of indexes) {
        htmlString += "<div class='card'><div class='card-body'>";
        htmlString += "<div id =" + index + "_submissionLoading></div>";
        htmlString += "<div id =" + index + "_submission></div>";
        htmlString += "<div id =" + index + "_sentimentLoading></div>";
        htmlString += "<div class='row' class='" + index + "'>"
        htmlString += "<div class='col-md-4'>"

        let afinnDivId = index + "_afinn";
        htmlString += "<div class='' id =" + afinnDivId + " +></div>";

        let cloudId = index + "_cloud";
        htmlString += "<div id='" + cloudId + "'></div>";
        htmlString += "</div>"
        htmlString += "<div class='col-md-4'>"

        let nrc = index + "_nrc";
        htmlString += "<div class='' id =" + nrc + "></div>";
        htmlString += "</div>";
        let chart = index + "_chart";
        htmlString += "<div class='col-md-4'>"
        htmlString += "<canvas id='" + chart + "'width='' height='400'></canvas>";
        htmlString += "</div>";
        htmlString += "</div></div></div><p></p>";
    }

    return htmlString;
}

