var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/database.db');
var crypto = require('crypto');
var http = require('http');
var process = require('process');

function createDB(){
	db.run("CREATE TABLE IF NOT EXISTS msg (msgid TEXT NOT NULL UNIQUE, pageid TEXT, time TEXT, email TEXT, name TEXT, body TEXT)");
}

function addMsg(pageid, email, name, body){
	let i = db.prepare("INSERT OR REPLACE INTO msg VALUES (?,?,?,?,?,?)");
	i.run([crypto.randomUUID(), pageid, Date.now() + "", email || "", name || "", body || ""]);
	i.finalize();
}

function printDB(){
	let s = db.prepare("SELECT * FROM msg");
	s.each([], function(err, row){
		console.log(row);
	});
}

function getPage(pageid, cb){
	let arr = [];
	let s = db.prepare("SELECT * FROM msg WHERE pageid = (?)");
	s.each([pageid], function(err, row){
		arr.push(row);
	}, ()=>{
		cb(arr);
	});
}

function setCORS(res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', 60*60*24*30);
}


function strUUID(str){
	let hash = ""
	for(let i = 0; i < 16; i++){
		hash = hash + cyrb53(str, i).toString(16);
	}
	//let arr = crypto.createHash('md5').update(str + "").digest('hex').match(/.{1,4}/g);
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

function server(req, res) {
	setCORS(res);
	console.log(req.url);
	
	if(req.method === 'POST'){
        let postBody = [];
        req.on('data', chunk => {
            postBody.push(chunk);
        });
        req.on('end', () => {
            try{
				let obj = JSON.parse(Buffer.concat(postBody).toString());
				console.log(obj);
				if((obj.email || obj.name) && obj.body && obj.pageid.match(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g)[0]){
					
					let body = obj.body.replace(/<[^>]*(applet|comment|embed|iframe|link|listing|meta|noscript|object|plaintext|script|xmp)[^>]*>/gmi,"")
					let pageid = obj.pageid.match(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g)[0];
					addMsg(pageid, obj.email, obj.name, body);
					
					res.statusCode = 200;
					res.setHeader('Content-Type', 'text/plain');
					res.end("ok");
				}
            }catch(e){
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end("Something wrong");
            }
        });
		
	}else if(req.method === 'GET' && req.url.match(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g)?.[0]){
		let uuid = req.url.match(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g)[0];
		getPage(uuid, (arr)=>{
			if(arr.length != 0){
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json; charset=utf-8');
				res.end(JSON.stringify(arr));
			}else{
				res.statusCode = 404;
				res.end("404");
			}
		});
	}else{
		res.statusCode = 200;
		let api = process.env.API_ENDPOINT ? process.env.API_ENDPOINT : (req.headers.host ? `https://${req.headers.host}/` : "https://scs.moegirl.live/");
		if(req.url == "/script.js"){
			res.setHeader('Content-Type', 'text/javascript');
			res.write(fs.readFileSync('script.js').toString().replace("https://scs.moegirl.live/", api));
		}else{
			res.setHeader('Content-Type', 'text/html');
			res.write(fs.readFileSync('index.html').toString().replace("https://scs.moegirl.live/", api));

		}
		res.end();

	}
}


createDB();
http.createServer(server).listen(3000);
