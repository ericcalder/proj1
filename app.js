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

if(process.env.JAWSDB_URL){
var connection = mysql.createConnection(process.env.JAWSDB_URL);  
}
else {
var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'stairadmin',
      password: process.env.MYSQL_PW,
      database: 'stairadmin',
      timezone: 'utc'
    });
}

var app = express();
app.set('view engine', 'ejs');
//app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

if(process.env.JAWSDB_URL){
var options = mysql.createConnection(process.env.JAWSDB_URL);  
}
else {
var options = {
    host: 'localhost',
    port: 3306,
    user: 'stairadmin',
    password: process.env.MYSQL_PW,
    database: 'stairadmin'
};
}

var sessionStore = new MySQLStore(options);

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    //cookie: {
      //  expires: 600000
    //}
}));

////// custom middleware //////////
//// hash password using sha512 algorithm ///
const hashpw=(req,res,next)=>{
	console.log('in hashpw')
	var password=req.body.password
	var salt='123'
		var sha512 = function(password, salt){
		    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
		    hash.update(password);
		    var value = hash.digest('hex');
		    return value
		};

req.passwordHash=sha512(password,salt);
//console.log('passwordHash==='+req.passwordHash+'len=='+req.passwordHash.length)
	next();
}
const logIn=(req,res, next)=>{
	var password = req.body.password;
	var pwhash=req.passwordHash;
	var email = req.body.email;
	//console.log('params=  '+password+' '+email)
	var qry='SELECT * FROM users WHERE email = ? AND pwhash = ?';
	connection.query(qry, [email, pwhash], function(error, results, fields) {
		if (results.length > 0) {
					req.session.loggedin = true;
					req.session.authenticated = true;
					req.session.email = email;
					console.log('results='+results)
		next();
		}
		 else {
		 	console.log('no results for login')
				res.render('login',{message:'Incorrect Username and/or Password!'})
				//res.send('Incorrect Username and/or Password!');
			}
	});//connection
}//auth
const isLoggedIn=(req, res, next)=>{
	 console.log('isLoggedIn CALLED '+req.session.loggedin);
    if (!req.session.loggedin) {
        res.redirect('/');
    }
    else {
    	next();
    }
}

///////////////////////////////////////////


app.get('/', function(req,res){
	console.log('in root');
res.render('login');
});
/*
app.post('/', hashpw, logIn,  function(req, res){
	console.log('in post  '+port)
	if(req.session.loggedin){
		res.render('index',{user:req.session.email})
	}
	else {res.send('not logged in')}
	//res.send('logged in')
})
*/

app.listen(port);