var express = require('express');
var router = express.Router();
var fs = require('fs');
const mysql=require('mysql');

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
//console.log('connection='+process.env.JAWSDB_URL)
//////////// middleware ///////////////////////////
var getWeek=(req,res,next)=>{
  console.log('in getWeek')
  ///// date functions ////////
  Date.prototype.getWeek = function() {
      var sixjan = new Date(this.getFullYear(),0,6);
      return Math.ceil((((this - sixjan) / 86400000) + sixjan.getDay()+1)/7);
      }
  var mysqlDate=(date)=>{
    var YYYY=date.getFullYear();
    var mm=date.getMonth()+1;
    var dd=date.getDate();
    if(mm<10){mm='0'+mm}
    if(dd<10){dd='0'+dd}
    var mysqldate="'"+YYYY+"-"+mm+"-"+dd+"'"
    //console.log('mysqldate='+mysqldate)
    return mysqldate
  }
  ////////////////////////////////////////////////////////

var arr=[2,1]
  var today = new Date();
   var end_of_week=new Date();
    end_of_week.setDate(end_of_week.getDate() + 7-today.getDay());
  //console.log('today=='+today+'   end_of_week='+end_of_week+
    //' week==='+end_of_week.getWeek())
  //console.log('week++++++++++'+end_of_week.getWeek()%2+
    //' week ==='+arr[end_of_week.getWeek()%2])

  mysqlDate(end_of_week)

  req.end_of_week=mysqlDate(end_of_week)// returns date as format 'YYYY-mm-dd'
  //end_of_week.getWeek() gives the week count from 6 jan
  // if end_of_week.getWeek() is even it's A week if odd it's B week
  // the freq field in db A week=1 B week=2
  req.isNot=arr[end_of_week.getWeek()%2]
  next();
}
////////////////////////////////////////////
router.get('/', function(req,res){
  console.log('in router /index ')
res.render('index',{ user:req.session.email})
})

router.get('/show', getWeek, function(req,res){
	console.log('in router index  '+req.end_of_week)
	var freq=['weekly', 'A_week', 'B_week', '_3weekly','_4weekly','Monthly'];
	 var qry="SELECT s.id, s.stair, s.next_clean, c.cleaner, s.freq, s.postcode, s.lat, s.lng, "+
     		" DATE_FORMAT(s.next_clean, '%d %b %Y') AS date from stairlist AS s"+
        ' INNER JOIN cleaners AS c'+
        ' ON c.id=s.cleaner_id'+
     		 " WHERE s.freq !="+req.isNot+
         " && (s.next_clean<"+req.end_of_week+
         " || s.next_clean IS NULL)"+
         " ORDER BY c.cleaner, s.stair;";

     console.log('qry='+qry)
     connection.query(qry, function(err,rows){
          if(err) throw err;
       
      res.locals.rows=rows  
      //res.local.freq=freq	
		//res.render('index',{rows:rows, user:req.session.email})	         
          res.send(rows)
            });//connection

	
//res.render('index',{rows:rows, user:req.session.email})

})

module.exports = router;

