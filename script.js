var scs = "https://scs.moegirl.live/"
var pageid = strUUID(window.location.host + window.location.pathname);
var ls = [];
function loadComments(){
    var req = new XMLHttpRequest();
    req.overrideMimeType("application/json");
    req.open('GET', scs + pageid, true);
    req.onload  = function() {
        let data = JSON.parse(req.responseText);
        let text = "<tr><th>Time</th><th>Name</th><th>Email</th><th>Comment</th></tr>";
        ls = data;
        text = text + data.map(x => `<tr><td>${new Date(parseInt(x.time, 10)).toLocaleString()}</td><td>${x.name}</td><td>${x.email}</td><td>${x.body}</td></tr>`).join("\n");
        document.getElementById('scs-comments').innerHTML = text;
    };
    req.send(null);
}
function sendComment(){
    let obj = {
        name: document.getElementById('scs-name').value,
        email: document.getElementById('scs-email').value,
        body: document.getElementById('scs-comment').value,
        pageid: strUUID(window.location.host + window.location.pathname)
    }
    var xhr = new XMLHttpRequest();
    xhr.open('POST', scs);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(obj));
    
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            loadComments();
            document.getElementById('scs-comment').value = "";
        }
    }
    
    console.log(obj);
}
function strUUID(str){
    let hash = ""
    for(let i = 0; i < 16; i++){
        hash = hash + cyrb53(str, i).toString(16);
    }
    let arr = hash.match(/.{1,4}/g);
    return `${arr[0]}${arr[1]}-${arr[2]}-${arr[3]}-${arr[4]}-${arr[5]}${arr[6]}${arr[7]}`;
}
function cyrb53(str, seed = 0){
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
loadComments();