// Method to fetch the indexes
const fetchIndexes = (utc, size) => {

    showLoading("submissions", true);
    fetch("./api/indexes/" + utc + ".json")
        .then(response => response.text())
        .then(data => {
            const response = JSON.parse(data);
            let indexes = response["indexes"];
            indexes = indexes.slice(0, size);
            // We build empty divs in preparation for the payload
            createDiv(indexes);
            // We can now fetch the submissions
            for (let index of indexes)
                fetchSubmission(index);
            showLoading("submissions", false);
        })
        .catch(err => {
            console.log(err);
            showLoading("submissions", false);
            showErrorDiv("submissions", "Please try at another time.")
        });
}

const showErrorDiv = (id, errorMessage) => {

    errorDiv = document.getElementById(id);

    htmlString = '<div class="alert alert-warning" role="alert">';
    htmlString += errorMessage;
    htmlString +='</div >'

    errorDiv.innerHTML = htmlString;
}

const fetchSubmission = (index) => {

    showLoading(index, true);
    fetch("./api/submissions/" + index + ".json")
        .then(response => response.text())
        .then(data => {
            const json = JSON.parse(data);
            // We should get all lexicons before building submissions.
            showLoading(index, false);
            buildSubmissions(json);
            processSentiments(index);
        });
}

const showLoading = (id, isLoading, loadingMessage) => {
    const postDiv = document.getElementById(id);
    if (isLoading)
        postDiv.classList.add("spinner-border");
    else
        postDiv.classList.remove("spinner-border");
}

const makeHTMLFromString = (str) => {
    let text = str;
    parsed = "<p>" + text + "</p>";
    parsed = parsed.replace(/\r\n\r\n/g, "</p><p>").replace(/\n\n/g, "</p><p>");
    parsed = parsed.replace(/\r\n/g, "<br />").replace(/\n/g, "<br />");
    return parsed;
}

const createDiv = (indexes) => {
    const submissionsDiv = document.getElementById("submissions");

    let htmlString = "";
    for (const index of indexes) {
        htmlString += "<div class='card'><div class='card-body'>";
        htmlString += "<div id =" + index + "></div>";

        htmlString += "<div class='row'>"
        htmlString += "<div class='col-4'>"

        let afinnDivId = index + "_afinn";
        htmlString += "<div class='' id =" + afinnDivId + " +></div>";

        let cloudId = index + "_cloud";
        htmlString += "<div id='" + cloudId + "'></div>";

        htmlString += "</div>"

        htmlString += "<div class='col-4'>"
        let nrc = index + "_nrc";
        htmlString += "<div class='' id =" + nrc + "></div>";

        htmlString += "</div>";

        let chart = index + "_chart";

        htmlString += "<div class='col-4'>"
        // htmlString += "<h5 class='card-title'><p class=text-center>" + "Breakdown of Replies" + "</p></h5>";
        htmlString += "<canvas id='" + chart + "'width='400' height='400'></canvas>";
        htmlString += "</div>";

        // htmlString += "<div class='col-6'>"
        // let chart = index + "_chart";
        // htmlString += "<div class='' id =" + chart + "></div>";

        // htmlString += "</div>";

        htmlString += "</div></div></div><p></p>";
    }

    submissionsDiv.innerHTML = htmlString;

}

const makeCloud = (id, words) => {
    htmlString = "";

    let cloudId = document.getElementById(id + "_cloud");

    // Get all keys
    words = Object.keys(words);


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
        .size([400, 400])
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


const buildSubmissions = (submission) => {
    const submissionDiv = document.getElementById(submission.id);
    htmlString = "<h1 class='card-title'>" + submission.title + "</h1>";
    htmlString += "<hr>"
    htmlString += "<small>" + convertDate(submission.created_utc) + "</small>";
    htmlString += "<p></p>"
    htmlString += "" + makeHTMLFromString(submission.selftext) + "";


    let link = "https://reddit.com/" + submission.permalink;

    htmlString +=
        "<p>View original post <a href='" + link + "' class='card-link'>here</a></p>";

    // replyString = JSON.stringify(submission.replies);


    // processAfinn(submission.id, submission.selftext);
    // processNRC(submission.id, submission.selftext);
    // processAfinn(submission.id, replyString);
    // processNRC(submission.id, replyString);
    // processCounts(submission.id, replyString);
    submissionDiv.innerHTML = htmlString;
    // processSentiments(submission.id);
    // makeCloud(submission.id);
}

const processSentiments = (id) => {


    showLoading(id + "_afinn", true);
    fetch("./api/summary/" + id + ".json")
        .then(response => response.text())
        .then(data => {
            showLoading(id + "_afinn", false);

            const response = JSON.parse(data);

            const counts = (response["counts"]);

            const chartLocation = id + "_chart";


            const chart_data = [counts.nta_count, counts.yta_count, counts.esh, counts.nah_count, counts.info_count]

            buildChart(chartLocation, chart_data);

            processNRC(id, response["emotion"]);

            // processAfinn(id, response["afinn"])
            makeCloud(id, response["word_freq"]);

        })
        .catch(err => {
            console.log(err);
        });

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

const processAfinn = (id, score) => {


    const location = id + "_afinn";

    let afinnResultsDiv = document.getElementById(location);


    if (score < 0) {
        afinnResultsDiv.innerHTML = '<div class="alert alert-warning" role="alert">Negative</div>';
    }

    if (score == 0) {
        afinnResultsDiv.innerHTML = '<div class="alert alert-info" role="alert">Neutral</div>';
    }

    if (score > 0) {
        afinnResultsDiv.innerHTML = '<div class="alert alert-success" role="alert">Positive</div>';
    }

    let tableHTML = '<table class="result-table table table-bordered table-striped mb-0"><thead><tr><th>Score</th></thead>';

    afinnResultsDiv.innerHTML += tableHTML + "<tr><td>" + score + "</td></tr></table>";;
}

const convertDate = (dateInUTC) => {
    const event = new Date(dateInUTC * 1000);
    displayTime = event.toDateString() + " " + event.toTimeString();
    return displayTime;
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

const selectPost = () => {

    let now = new Date();
    let today = new Date(); //(now.getTime() + now.getTimezoneOffset() * 60000);
    let yesterday = new Date(); //(now.getTime() + now.getTimezoneOffset() * 60000)
    yesterday.setDate(today.getDate() - 1)

    const yesterday_utc = Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()) / 1000;

    const noOfPost = document.getElementById("numberOfPost");

    noOfPost.addEventListener("change", (event) => {
        submissionDiv = document.getElementById("submissions");
        submissionDiv.innerHTML = "";
        fetchIndexes(yesterday_utc, event.target.value);
    })

}

const defaultPosts = () => {

    let now = new Date();
    let today = new Date(); //(now.getTime() + now.getTimezoneOffset() * 60000);
    let yesterday = new Date(); //(now.getTime() + now.getTimezoneOffset() * 60000)
    yesterday.setDate(today.getDate() - 1)

    const yesterday_utc = Date.UTC(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()) / 1000;

    fetchIndexes(yesterday_utc, 5)
}

selectPost();
defaultPosts()
