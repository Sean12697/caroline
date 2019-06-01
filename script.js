const api = "https://caroline-server.herokuapp.com/"; // user/Sean12697

window.addEventListener("load", () => {
    let params = paramsToObj();
    reqData("GET", {}, `${api}user/${ params.user ? params.user : "Sean12697" }`, (data) => {
        document.getElementById("name").innerHTML = data.user.name;
        document.getElementById("img").src = data.user.profile_image_url;
    }, (err) => {});
});

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