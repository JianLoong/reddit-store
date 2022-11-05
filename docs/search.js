// Method to fetch the indexes
const fetchSearchIndex = () => {
    fetch("./api/search/search.json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(data => {
            let searchCorpus = data;
            searchInput(searchCorpus);
        })
        .catch(err => {
            showErrorDiv("submission", "Sorry, something went wrong...")
        });
}

const createSentimentDiv = (index) => {

    const submissionDiv = document.getElementById("submissionSentiment");
    let htmlString = "";
    htmlString += "<div class='card'><div class='card-body'>";
    htmlString += "<div id =" + index + "></div>";
    htmlString += "<div class='row'>"
    htmlString += "<div class='col-lg-4'>"
    let afinnDivId = index + "_afinn";
    htmlString += "<div class='' id =" + afinnDivId + " +></div>";

    let cloudId = index + "_cloud";
    htmlString += "<div id='" + cloudId + "'></div>";
    htmlString += "</div>"

    htmlString += "<div class='col-lg-4'>"
    let nrc = index + "_nrc";
    htmlString += "<div class='' id =" + nrc + "></div>";
    htmlString += "</div>";
    let chart = index + "_chart";
    htmlString += "<div class='col-lg-4'>"
    // htmlString += "<h5 class='card-title'><p class=text-center>" + "Breakdown of Replies" + "</p></h5>";
    htmlString += "<canvas id='" + chart + "'width='' height='400'></canvas>";
    htmlString += "</div>";
    htmlString += "</div></div></div><p></p>";
    submissionDiv.innerHTML = htmlString;

}

const processNRC = (id, nrc) => {
    const location = id + "_nrc";
    let nrcResultsDiv = document.getElementById(location);
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
    nrcResultsDiv.innerHTML = tableHTML;
}

const showLoading = (id, isLoading, loadingMessage) => {
    const postDiv = document.getElementById(id);
    if (isLoading)
        postDiv.classList.add("spinner-border");
    else
        postDiv.classList.remove("spinner-border");
}


const tableRowListener = () => {
    const rows = document.querySelectorAll(".searchRow");
    rows.forEach((e) => {
        e.addEventListener(("click"), (event) => {
            const resultDiv = document.getElementById("resultDiv");
            resultDiv.classList.add("d-none");
            const submissionID = event.target.parentNode.parentNode.getAttribute("id");
            event.preventDefault();
            event.stopPropagation();
            const searchInputBox = document.getElementById("search");
            searchInputBox.value = "";
            createSentimentDiv(submissionID);
            fetchSubmission(submissionID);
        })
    })
}

const convertDate = (dateInUTC) => {
    const event = new Date(dateInUTC * 1000);
    displayTime = event.toDateString() + " " + event.toTimeString();
    return displayTime;
}

const makeHTMLFromString = (str) => {
    let text = str;
    parsed = "<p>" + text + "</p>";
    parsed = parsed.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
    parsed = parsed.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
    return parsed;
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

const processSentiments = (id) => {

    fetch("./api/summary/" + id + ".json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(data => {

            const response = data;
            const counts = (response["counts"]);
            const chartLocation = id + "_chart";
            const chart_data = [counts.nta_count, counts.yta_count, counts.esh, counts.nah_count, counts.info_count]

            buildChart(chartLocation, chart_data);
            processNRC(id, response["emotion"]);
            makeCloud(id, response["word_freq"]);

        })
        .catch(err => {
            const submissionSentimentDiv = document.getElementById("submissionSentiment");
            submissionSentimentDiv.innerHTML = "No analytics found for this submission.";
        })

}

const fetchSubmission = (index) => {

    const submissionSentimentDiv = document.getElementById("submissionSentiment");
    const submission = document.getElementById("submission");
    submissionSentimentDiv.classList.add("d-none");

    fetch("./api/submissions/" + index + ".json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(data => {
            const json = data;
            submissionSentimentDiv.classList.remove("d-none");
            buildSubmissions(json);
            processSentiments(index);

        })
        .catch(err => {
            submission.innerHTML = "No information found for this.";
            submissionSentimentDiv.innerHTML = "No analytics found for this submission.";
        });
}

const buildSubmissions = (submission) => {
    const submissionDiv = document.getElementById("submission");
    htmlString = "<h1 class='card-title'>" + submission.title + "</h1>";
    htmlString += "<hr>"
    htmlString += "<small>" + convertDate(submission.created_utc) + "</small>";
    htmlString += "<p></p>"
    htmlString += "" + makeHTMLFromString(submission.selftext) + "";

    let link = "https://reddit.com/" + submission.permalink;

    htmlString +=
        "<p>View original post <a href='" + link + "' class='card-link'>here</a></p>";
    htmlString += "<p>Number of replies <strong>" + submission.replies.length + "</strong></p>";

    submissionDiv.innerHTML = htmlString;
}

const searchInput = (searchCorpus) => {

    const searchInputBox = document.getElementById("search");
    const options = {
        keys: [
            "id",
            "title"
        ]
    };

    const fuse = new Fuse(searchCorpus, options);
    searchInputBox.addEventListener(("keypress"), (event) => {
        if (event.key != "Enter")
            return;

        event.preventDefault();

        const resultDiv = document.getElementById("resultDiv");

        resultDiv.classList.remove("d-none");
        // Remove autofocus
        searchInputBox.blur();
        searchInputBox.removeAttribute("autofocus");

        const submissionDiv = document.getElementById("submission");
        const searchResults = document.getElementById("searchResults");
        const submissionSentimentDiv = document.getElementById("submissionSentiment")
        const noResultsDiv = document.getElementById("noResults");

        submissionDiv.innerHTML = "";
        submissionSentimentDiv.innerHTML = "";
        searchResults.innerHTML = "";
        noResultsDiv.innerHTML = "";

        const searchQuery = event.target.value;
        const results = fuse.search(searchQuery);

        htmlString = "";

        if (results.length == 0){

            htmlString += '<div class="alert alert-info" role="alert">No results found.</div>';
            
            noResultsDiv.innerHTML = htmlString;
            resultDiv.classList.add("d-none");
            return;
        }

        for (let result of results) {
            htmlString += "<tr id='" + result["id"] + "' class='searchRow'><td>" + result["id"] + "</td>";
            htmlString += " ";
            htmlString += "<td class='text-wrap'><a href='#' class='pe-auto'>" + result["title"] + "</a></td>"
            htmlString += "</tr>";
        }

        searchResults.innerHTML = htmlString;
        tableRowListener();
    });
}

const makeCloud = (id, words) => {
    htmlString = "";

    let cloudId = document.getElementById(id + "_cloud");

    // Get all keys
    words = Object.keys(words);

    let keys = Object.keys(words);
    let values = Object.values(words);
    let processedWords = [];
    let sum = 0;

    for (let i = 0; i < keys.length; i++) {
        processedWords.push({
            "text": keys[i],
            "size": values[i]
        })
        sum += values;
    }

    // console.log(cloudId);
    const width = document.getElementById(id + "_cloud").getBoundingClientRect().width;

    const draw = (words) => {
        d3.select(cloudId).append("svg")
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
        .rotate(function () { return 0; })
        .font("Impact")
        .fontSize(function (d) { return d.size; })
        .on("end", draw);

    layout.start();

}

fetchSearchIndex();
