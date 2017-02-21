var http = require("http");
var mysql = require("mysql");
var fs = require('fs');
const wol = require('wol');


// SQL Connection
var con = mysql.createConnection({
  host: "localhost",
  user: "service",
  password: "service",
  database: "app"
});


con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});


//Lets define a port we want to listen to
const PORT = process.env.PORT; 

//We need a function which handles requests and send response

function jsontodb(body) {
    console.log("inside jsontodb")
    var jsonobject = JSON.parse(body);
    console.log(jsonobject)
    var post = {title: jsonobject.title, message: jsonobject.message};
    console.log(post);
    con.query('INSERT INTO app_table set ?', post);
}

function dbtojson() {
  function dbListCall(data, callback) {
    con.query('SELECT * FROM app_table', function (error, results, fields) {
        if (error) {
            callback("Error communicating");
        } else {
          console.log("incallback")
          callback(fields);
          console.log(fields);
        }
    });
  }
  var results;
  dbListCall( function(err, content) {
      if (err) {
        console.log(err);
      } else {
      results = content;
      }
    });
  console.log(results);
  return results;
}

http.createServer(function(request, response) {
    var body = [];
    console.log(request.url);
    if (request.url == "/") {
      fs.readFile('index.html', function(error, content) {
    	if (error) {
    			response.writeHead(500);
    			response.end();
   		} else {
    		  response.writeHead(200, { 'Content-Type': 'text/html' });
    		  response.end(content, 'utf-8');
    	}
      });
    }
    if (request.url == "/consumer") {
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      console.log(body)
      jsontodb(body);
    });
    }
    if (request.url == "/list") {
      var payload = dbtojson();
      response.writeHead(200, { 'Content-Type': 'text/html' });
  		response.end(payload, 'utf-8');
    }
    
}).listen(PORT);





 
