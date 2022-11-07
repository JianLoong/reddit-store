// Method to fetch the indexes
const fetchIndex = ({
    order = "hot",
    startUTC = defaultStartUTC(),
    endUTC = defaultEndUTC(),
    noOfPost = 10
} = {}) => {

    showLoading("submissionsLoading", true);
   
    fetch("./api/indexes/indexes.json" + '?' + Math.random())
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong");
        })
        .then(result => {
            const indexes = sortIndexes(result, startUTC, endUTC, noOfPost, order);

            return indexes;
        })
        .then(result => {
            showLoading("submissionsLoading", false);
            const submissionsDiv = document.getElementById("submissions");
           

            submissionsDiv.innerHTML = createDiv(result);
            for (let index of result)
                fetchSubmission(index);
        })
        .catch(err => {
            console.log(err);
            showErrorDiv("searchInvalid", err, true);
            showLoading("submissionsLoading", false);
            document.getElementById("submissions").classList.add("d-none");
            //setupDatePicker();
        });
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
            let submission = json;
            const submissionDiv = document.getElementById(submission.id + "_submission");
            submissionDiv.innerHTML = buildSubmissions(submission)
            processSentiments(index);
        })
        .catch(err => {
            showErrorDiv("submissions", "Please try at another time.")
        });
}

const sortIndexes = (data, startUTC, endUTC, noOfPost, order) => {

    const sorted = [];
    data.map((element) => {
        const utc = element["created_utc"];
        if (utc > startUTC)
            if (utc < endUTC)
                sorted.push(element);
    })

    if (sorted.length == 0) {
        throw new Error("No entries found.")
    }

    if (order == "hot")
        sorted.sort((a, b) => a.score - b.score);
    else
        sorted.sort((a, b) => b.created_utc - a.created_utc);

    const sliced = sorted.slice(0, noOfPost);

    let indexes = [];
    indexes.push(...sliced.map(e => e.id));

    return indexes;
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

            const location = id + "_nrc";
            let nrcResultsDiv = document.getElementById(location);

            const emotions = response["emotion"];
            nrcResultsDiv.innerHTML = processNRC(emotions);

            const cloudLocation = id + "_cloud";
            makeCloud(cloudLocation, response["word_freq"]);

        })
        .catch(err => {
            showLoading(id + "_sentimentLoading", false);
            showErrorDiv(id + "_sentimentLoading", true)
        });

}

const defaultStartUTC = () => {
    const startOfToDay = new Date();
    startOfToDay.setHours(0, 0, 0, 0);
    const startUTC = startOfToDay.getTime() / 1000;
    return startUTC;
}

const defaultEndUTC = () => {

    const endOfToday = new Date();
    endOfToday.setDate(endOfToday.getDate() + 1);
    endOfToday.setHours(0, 0, 0, 0);
    const endUTC = endOfToday.getTime() / 1000;
    return endUTC;
}

const config = () => {



    const noOfPost = document.getElementById("numberOfPost").value;
    const sortOrder = document.getElementById("sortOrder").value;
    const dateInput = document.querySelector('input[type="date"]');
    const day = dateInput.valueAsDate;

    if (day == undefined)
        throw new Error("Enter a valid date");

    const startOfDay = new Date(day);
    const endOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay.setHours(24, 0, 0, 0);

    const startUTC = startOfDay.getTime() / 1000;
    const endUTC = endOfDay.getTime() / 1000;

    return {
        "startUTC": startUTC || defaultStartUTC(),
        "endUTC": endUTC || defaultEndUTC(),
        "noOfPost": noOfPost || 10,
        "order": sortOrder || "hot"
    }

}

const defaultPosts = () => {
    fetchIndex(config());
}

const validateQuery = () => {

    let query = {};
    const submissionsDiv = document.getElementById("submissions");
    submissionsDiv.classList.add("d-none");
    try {
        query = config();
        submissionsDiv.classList.remove("d-none");
        showErrorDiv("searchInvalid", "", false);
    } catch (error) {
        showErrorDiv("searchInvalid", error, true);
        submissionsDiv.classList.add("d-none");
    }

    return query;
}

const setUpListeners = () => {

    const dateInput = document.querySelector('input[type="date"]');
    dateInput.addEventListener("change", (event) => {
        let query = validateQuery();
        fetchIndex(query);
    });

    const sortOrder = document.getElementById("sortOrder");
    sortOrder.addEventListener("change", (event) => {
        let query = validateQuery();
        fetchIndex(query);
    });

    const noOfPost = document.getElementById("numberOfPost");
    noOfPost.addEventListener("change", (event) => {
        let query = validateQuery();
        fetchIndex(query);;
    });

    const setupDatePicker = () => {
        const dateControl = document.querySelector('input[type="date"]');
        let max = new Date().toLocaleString('sv').split(" ")[0];
        const minDate = new Date(Date.UTC(2022, 10, 01));
        dateControl.value = max;
        dateControl.setAttribute("max", max);
        dateControl.setAttribute("min", minDate.toISOString().split("T")[0]);
    }

    setupDatePicker();
}

const showErrorDiv = (id, errorMessage, isShown) => {

    errorDiv = document.getElementById(id);

    if (isShown == false) {
        errorDiv.classList.add("d-none");
        return;
    }
    errorDiv.classList.remove("d-none");
    htmlString = '<div class="alert alert-warning" role="alert">';
    htmlString += errorMessage;
    htmlString += '</div >'
    errorDiv.innerHTML = htmlString;

    return htmlString;
}

const showLoading = (id, isLoading, loadingMessage) => {
    const postDiv = document.getElementById(id);
    if (isLoading){
        postDiv.classList.add("spinner-border");
        postDiv.classList.remove("d-none");
    }
    else{
        postDiv.classList.remove("spinner-border");
        postDiv.classList.add("d-none");
    }
}


const ac = new AbortController();
setUpListeners(ac);
defaultPosts(ac);
