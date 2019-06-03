const api = "https://caroline-server.herokuapp.com/",
    months = new Map([
        [1, 'January'],
        [2, 'February'],
        [3, 'March'],
        [4, 'April'],
        [5, 'May'],
        [6, 'June'],
        [7, 'July'],
        [8, 'August'],
        [9, 'September'],
        [10, 'October'],
        [11, 'November'],
        [12, 'December']
    ]),
    abvMonths = new Map([
        [1, 'Jan'],
        [2, 'Feb'],
        [3, 'March'],
        [4, 'Apr'],
        [5, 'May'],
        [6, 'Jun'],
        [7, 'Jul'],
        [8, 'Aug'],
        [9, 'Sept'],
        [10, 'Oct'],
        [11, 'Nov'],
        [12, 'Dec']
    ]),
    abvDays = new Map([
        [0, "Sun"],
        [1, "Mon"],
        [2, "Tue"],
        [3, "Wed"],
        [4, "Thur"],
        [5, "Fri"],
        [6, "Sat"]
    ]);

window.addEventListener("load", () => {

    let params = paramsToObj();

    reqData("GET", {}, `${api}user/${ params.user ? params.user : "Sean12697" }`, (data) => {
        console.log(data);
        document.title = `Monitor: ${data.user.name} - Twitter`;
        document.getElementById("name").innerHTML = data.user.name;
        document.getElementById("img").src = data.user.profile_image_url;
        document.getElementById("sadTweets").innerHTML = data.sadTweets.map(tweet =>
            `<div class="tweet">
                <p class="date"><a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}" target="_blank">${tweet.created_at.substr(0, tweet.created_at.length-11)}</a></p>
                <p><b>${tweet.sentiment.score}</b>: ${tweet.full_text.split(" ").map(word => {
                    word = returnWordWithUserLink(word); // If refering to a user, add a hyperlink
                    if (tweet.sentiment.negative.includes(word)) word = "<b>" + word + "</b>"; // if the word has been detected as negative, make bold
                    return word;
                }).join(" ")}</p>
            </div>`
        ).join("");
        anychart.fromJson(lineChartTemplate("Sentiment Per Tweets", data.sentiments.map((value, time) => {
            return {
                x: time,
                value: value
            }
        }), "avgSentiment")).draw();
    }, (err) => {});

    reqData("GET", {}, `${api}userMood/${ params.user ? params.user : "Sean12697" }`, (data) => {
        console.log("Day Mood Data: ", data);
        document.getElementById("moodTweets").innerHTML = data.map(dayTweets => {
            let moods = moodsArray(dayTweets.Anger, dayTweets.Fear, dayTweets.Joy, dayTweets.Sadness, dayTweets.Analytical, dayTweets.Confident, dayTweets.Tentative);
            return `<div class="tweet">
                <p>${htmlDate(dayTweets.Date)} (${ dayTweets.Messages.length > 1 ? dayTweets.Messages.length + " Tweets" : "1 Tweet" })</p>
                ${ moods.map(moodToHTML).join("") }
                ${ dayTweets.Messages.map(tweet => "<p>" + tweet.split(" ").map(returnWordWithUserLink).join(" ") + "</p>").join("") }
            </div>`
        }).join("");
    }, (err) => {});

});

function moodToHTML(mood) {
    return `<div class="mood">
        <p>${mood.name}</p>
        <p>${mood.emoji}</p>
        <p>${floatToStringPercent(mood.value)}</p>
    </div>`
}

function returnWordWithUserLink(word) {
    return (word.includes("@")) ? `<a href='https://twitter.com/${word.replace("@", "")}' target='_blank'>${word}</a>` : word;
}

function reqData(type, params, url, callback, errorCallback) {
    $.ajax({
        type: type,
        url: url,
        data: params,
        dataType: "application/json",
        success: res => responseCallback(res, callback, errorCallback),
        error: res => responseCallback(res, callback, errorCallback)
    });
}

function responseCallback(response, callback, errorCallback) {
    console.log(`RS: ${response.readyState} - S: ${response.status} - T: ${response.statusText} - URL: ${response.responseURL}`);
    if (response.readyState == 4 && response.status == 200) {
        let data = JSON.parse(response.responseText);
        callback(data);
    } else if (response.readyState == 4 && response.status != 200) {
        errorCallback();
    }
}

function paramsToObj() {
    let params = window.location.search,
        obj = {};
    let array = params.replace("?", "").split("=");
    for (let i = 0; i < array.length; i += 2) obj[array[i]] = array[i + 1];
    return obj;
}

function htmlDate(string) {
    let date = new Date(string);
    return `${abvDays.get(date.getDay())}, ${abvMonths.get(date.getMonth()+1)} ${date.getDate()}`;
}

function lineChartTemplate(text, data, container) {
    return {
        chart: {
            type: "line",
            title: {
                text: text
            },
            series: [{
                seriesType: "column",
                data: data
            }],
            container: container
        }
    }
}

function moodsArray(anger, fear, joy, sadness, analytical, confident, tentative) {
    return [{
        name: "Anger",
        emoji: "😡",
        value: anger
    }, {
        name: "Fear",
        emoji: "😨",
        value: fear
    }, {
        name: "Joy",
        emoji: "😃",
        value: joy
    }, {
        name: "Sadness",
        emoji: "😢",
        value: sadness
    }, {
        name: "Analytical",
        emoji: "🤔",
        value: analytical
    }, {
        name: "Confident",
        emoji: "😎",
        value: confident
    }, {
        name: "Tentative",
        emoji: "😕",
        value: tentative
    }].sort((a, b) => b.value - a.value);
}

function floatToStringPercent(float) {
    return `${Math.round(float * 100)}%`
}