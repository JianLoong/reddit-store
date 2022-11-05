// Method to fetch the indexes
const fetchIndex = () => {
    showLoading("submissionsLoading", true);
    fetch("./api/indexes/indexes.json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(result => {
            showLoading("submissionsLoading", false);
            const data = result;
            const query = getRequiredInformation();

            const startUTC = query[0];
            const endUTC = query[1];
            const noOfPost = query[2];
            const order = query[3];

            const sorted = [];
            data.map((element) => {
                const utc = element["created_utc"];
                if (utc > startUTC)
                    if (utc < endUTC)
                        sorted.push(element);
            })

            if (sorted.length == 0){
                document.getElementById("submissions").value.innerHTML = "";
                showErrorDiv("submissionsLoading", "No entries found for this date.");
                return;
            }

            if (order == "hot")
                sorted.sort((a, b) => a.score - b.score);
            else
                sorted.sort((a, b) => b.created_utc - a.created_utc);

            const sliced = sorted.slice(0, noOfPost);

            let indexes = [];
            indexes.push(...sliced.map(e => e.id));

            createDiv(indexes);

            for (let index of indexes)
                fetchSubmission(index);
        })
        .catch(err => {
            console.log(err);
            showErrorDiv("submissions", "No entries found. Please enter a valid date.");
        });
}

const showErrorDiv = (id, errorMessage) => {
    errorDiv = document.getElementById(id);
    htmlString = '<div class="alert alert-warning" role="alert">';
    htmlString += errorMessage;
    htmlString += '</div >'
    errorDiv.innerHTML = htmlString;
}

const fetchSubmission = (index) => {
    showLoading(index + "_submissionLoading", true);
    fetch("./api/submissions/" + index + ".json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong");
        })
        .then(data => {
            showLoading(index + "_submissionLoading", false);
            const json = data;
            buildSubmissions(json);
            processSentiments(index);
        })
        .catch(err => {
            console.log(err);
            showErrorDiv("submissions", "Please try at another time.")
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
    submissionsDiv.innerHTML = htmlString;
}

const makeCloud = (id, words) => {
    htmlString = "";
    let cloudId = document.getElementById(id + "_cloud");

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

    // This computed width is used to draw the cloud so that the size is right.
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

const buildSubmissions = (submission) => {
    const submissionDiv = document.getElementById(submission.id + "_submission");
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
    submissionDiv.innerHTML = htmlString;
}

const processSentiments = (id) => {

    showLoading(id + "_sentimentLoading", true);
    fetch("./api/summary/" + id + ".json")
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(data => {
            showLoading(id + "_sentimentLoading", false);
            const response = data;
            const counts = (response["counts"]);
            const chartLocation = id + "_chart";
            const chart_data = [counts.nta_count, counts.yta_count, counts.esh, counts.nah_count, counts.info_count]
            buildChart(chartLocation, chart_data);
            processNRC(id, response["emotion"]);
            makeCloud(id, response["word_freq"]);
        })
        .catch(err => {
            showLoading(id + "_sentimentLoading", false);
            console.log(err);
            showErrorDiv(id + "_sentimentLoading", "Something went wrong")
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

    htmlString = "<h5 class='card-title'><p class=text-center>" + "Results of NRC Emotion Lexicon Analysis" + "</p></h5>";

    nrcResultsDiv.innerHTML = htmlString + tableHTML;
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
    const noOfPost = document.getElementById("numberOfPost");
    noOfPost.addEventListener("change", (event) => {
        fetchIndex();
    })
}

const selectOrder = () => {
    sortOrder.addEventListener("change", (event) => {
        let info = getRequiredInformation();
        fetchIndex();
    })
}

const defaultPosts = () => {
    fetchIndex();
}

const setupDatePicker = () => {
    const dateControl = document.querySelector('input[type="date"]');
    let max = new Date().toLocaleString('sv').split(" ")[0];
    const minDate = new Date(Date.UTC(2022, 10, 01));
    dateControl.value = max;
    dateControl.setAttribute("max", max);
    dateControl.setAttribute("min", minDate.toISOString().split("T")[0]);
}

const selectDate = () => {
    const dateInput = document.querySelector('input[type="date"]');
    dateInput.addEventListener("input", (event) => {
        fetchIndex();
    })
}

// This method returns the date in unix time, the number of post and sorting order.
const getRequiredInformation = () => {
    const endOfDay = document.getElementById("date").valueAsDate;
    if (endOfDay == null) {
        showErrorDiv("submissions", "Please enter a valid date");
        return;
    }

    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setUTCHours(0, 0, 0, 0);
    let startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    startOfDay.setDate(endOfDay.getDate() - 1);

    const startUTC = startOfDay.getTime() / 1000;
    const endUTC = endOfDay.getTime() / 1000;

    const noOfPost = document.getElementById("numberOfPost").value;
    const sortOrder = document.getElementById("sortOrder").value;

    return [startUTC, endUTC, noOfPost, sortOrder];
}

setupDatePicker();
selectDate();
selectPost();
defaultPosts()
selectOrder();
