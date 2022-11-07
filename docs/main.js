// Method to fetch the indexes
const fetchIndex = ({
    order,
    startUTC,
    endUTC,
    noOfPost
} = {}) => {
    fetch("./api/indexes/indexes.json" + '?' + Math.random())
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error("Something went wrong")
        })
        .then(result => {
            const indexes = sortIndexes(result, startUTC, endUTC, noOfPost, order);
            return indexes;
        })
        .then(result => {
            const submissionsDiv = document.getElementById("submissions");
  
            submissionsDiv.innerHTML = createDiv(result);
            for (let index of result)
                fetchSubmission(index);
        })
        .catch(err => {
            //showErrorDiv("submissionLoading", err.getMessage(), true);
            //console.log(err);
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
            showErrorDiv(id + "_sentimentLoading", "Something went wrong")
        });

}

const config = () => {

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
    
    const noOfPost = document.getElementById("numberOfPost").value;
    const sortOrder = document.getElementById("sortOrder").value;
    const dateInput = document.querySelector('input[type="date"]');
    const day = dateInput.valueAsDate;

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

const setUpListeners = () => {
    const dateInput = document.querySelector('input[type="date"]');
    dateInput.addEventListener("blur", (event) => {
        fetchIndex(config());
    });

    const sortOrder = document.getElementById("sortOrder");
    sortOrder.addEventListener("change", (event) => {
        fetchIndex(config());
    });

    const noOfPost = document.getElementById("numberOfPost");
    noOfPost.addEventListener("change", (event) => {
        fetchIndex(config());
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

setUpListeners();
defaultPosts();
