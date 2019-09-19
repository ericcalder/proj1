require('dotenv').config()
var express=require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
const mysql=require('mysql');
var session = require('express-session');
var crypto = require('crypto');
var MySQLStore = require('express-mysql-session')(session);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'stairadmin',
      password: process.env.MYSQL_PW,
      database: 'stairadmin',
      timezone: 'utc'
    });

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

var options = {
    host: 'localhost',
    port: 3306,
    user: 'stairadmin',
    password: process.env.MYSQL_PW,
    database: 'stairadmin'
};

var sessionStore = new MySQLStore(options);

app.get('/', function(req,res){
	console.log('in root');
res.render('login');
});




app.listen(port);