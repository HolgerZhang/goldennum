const KEY_SAVED_ROOM_ID = "SAVED_ROOM_ID";
const KEY_SAVED_USER_ID = "SAVED_USER_ID";
const KEY_SAVED_TOKEN = "SAVED_TOKEN";
const KEY_SAVED_SIGNED_IN = "SAVED_SIGNED_IN";
const KEY_USER_SCORE_PREFIX = "USER_SCORE_";

function getSavedRoomId() {
    let savedRoomId = parseInt(localStorage.getItem(KEY_SAVED_ROOM_ID));
    if (savedRoomId > 0) {
        return savedRoomId;
    }
    console.error(`getSavedRoomId invalid: ${savedRoomId}`);
    return 1;
}

function setSavedRoomId(id) {
    if (parseInt(id) > 0) {
        localStorage.setItem(KEY_SAVED_ROOM_ID, id);
        return true;
    }
    console.error(`setSavedRoomId invalid: ${id}`)
    return false;
}

function strEncode(s) {
    let a = [];
    for (const c of s) {
        a.push(c);
    }
    return btoa(JSON.stringify(a));
}

function strDecode(b) {
    const a = JSON.parse(atob(b));
    let s = "";
    for (const c of a) {
        s += c;
    }
    return s;
}

function getSavedToken() {
    const b = localStorage.getItem(KEY_SAVED_TOKEN);
    let t = "";
    try {
        t = strDecode(b);
    } catch (err) {
        return "";
    }
    return t;
}

function setSavedToken(t) {
    if (typeof t !== "string") {
        return;
    }
    const b = strEncode(t);
    localStorage.setItem(KEY_SAVED_TOKEN, b);
}

const URL_ROOM_LIST = BASE_URL + "/rooms/";
const URL_ROOM_INFO = BASE_URL + "/room/";
const URL_ROOM_SYNC = BASE_URL + "/sync/";
const URL_USER_CREATE = BASE_URL + "/users/";
const URL_USER_INFO = BASE_URL + "/user/";
const URL_USER_SUBMIT = BASE_URL + "/user/";
const URL_USER_AUTH = BASE_URL + "/user/";
const URL_ROOM_START = BASE_URL + "/room/";
const URL_ROOM_STOP = BASE_URL + "/room/";
const URL_ROOM_CREATE = BASE_URL + "/room/";

function jsonResponseHandler(response) {
    if (!response.ok) {
        throw {
            error: response.statusText,
            data: response.json(),
        }
    }
    return response.json()
}

async function fetchPostData(url, data) {
    const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    });
    return jsonResponseHandler(response);
}

async function fetchPutData(url, data) {
    const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'PUT',
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
    });
    return jsonResponseHandler(response);
}

async function fetchGetData(url) {
    const response = await fetch(url, {
        method: 'GET',
    });
    return jsonResponseHandler(response);
}

async function fetchDeleteData(url) {
    const response = await fetch(url, {
        method: 'DELETE',
    });
    return jsonResponseHandler(response);
}

function getRoomList() {
    return fetchGetData(URL_ROOM_LIST)
}

function getRoomInfo(roomId) {
    return fetchGetData(URL_ROOM_INFO + parseInt(roomId))
}

function getRoomSync(roomId) {
    return fetchGetData(URL_ROOM_SYNC + parseInt(roomId))
}

function postUserCreate(roomId, username, password) {
    return fetchPostData(URL_USER_CREATE + parseInt(roomId), {
        Username: String(username),
        Password: String(password),
    })
}

function getUserInfo(userId) {
    return fetchGetData(URL_USER_INFO + parseInt(userId))
}

function postUserSubmit(userId, password, submit1, submit2) {
    return fetchPostData(URL_USER_SUBMIT + parseInt(userId), {
        Password: String(password),
        Submit1: parseFloat(submit1),
        Submit2: parseFloat(submit2),
    })
}

function putUserAuth(userId, password) {
    return fetchPutData(URL_USER_AUTH + parseInt(userId), {
        Password: String(password)
    })
}

function deleteStopRoom(roomId) {
    return fetchDeleteData(URL_ROOM_STOP + parseInt(roomId));
}

function putStartRoom(roomId) {
    return fetchPutData(URL_ROOM_START + parseInt(roomId));
}

function postCreateRoom(interval, rounds) {
    return fetchPostData(URL_ROOM_CREATE, {
        Interval: parseInt(interval, 10),
        RoundTotal: parseInt(rounds, 10),
    });
}

// cookies
function createCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setDate(date.getDate() + days)
        expires = date.toUTCString();
    }
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function setLanguage(lang) {
    createCookie("lang", lang, 30);
    location.reload();
}