var express = require('express');
var router = express.Router();
var path = require('path');
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
/////////////middleware ////////////////////////////////////
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
///////////////end of middleware functions ////////////////////////////////
//////////////////////////////////////////////



router.get('/cleanerslist', function(req,res){
  res.render('cleanerslist',{user:req.session.email})
})

router.get('/cleanerslist/data', function(req,res){
  console.log('in cleanerslist/data')
  var qry="SELECT id, cleaner"+
      " from cleaners;";
      
  console.log('qry='+qry)
  connection.query(qry, function(err,rows){
          if(err) throw err;
          
                res.send(rows)
            });//connection

})

router.get('/cleanerslist/delete', function(req,res){
  //console.log('in /cleanerslist/delete')
  //console.log('req.query='+JSON.stringify(req.query.id))
  //console.log('req.query='+JSON.parse(req.query.id))
  var qry="DELETE from cleaners"+
          " WHERE id="+JSON.parse(req.query.id)+";";
  //console.log('delete qry='+qry)
    connection.query(qry, function(err,result,fields){
          if(err) throw err;
           // console.log('Data received from Db:\n');
           // console.log('the variable rows====',rows);
            console.log('result=='+JSON.stringify(result)+'   '+result.affectedRows)
                res.send(result)
            });//connection 
  //res.end();
})


router.post('/cleanerslist/new',function(req,res){
  console.log('in new cleaner')
  console.log('req.body='+JSON.parse(req.body.arr)[0].value)
  var name=JSON.parse(req.body.arr)[0].value
  var qry="INSERT into cleaners"+
          " (cleaner)"+
          " VALUES ('"+name+"');";
  console.log('qry=='+qry)
  connection.query(qry, function(err,result,fields){
          if(err) throw err;
           // console.log('Data received from Db:\n');
           // console.log('the variable rows====',rows);
            console.log('result=='+JSON.stringify(result)+'   '+result.changedRows)
                res.send(result)
            });//connection 
  //res.end()
})

/////// populate cleaner dropdown menu /////
router.get('/menu', function(req,res){
	console.log('in router cleaners/menu')
	var qry="SELECT id, cleaner"+
			" from cleaners;";
			
	console.log('qry='+qry)
	connection.query(qry, function(err,rows){
          if(err) throw err;
          
                res.send(rows)
            });//connection

})

router.get('/all',function(req,res){
 console.log('in router get all req.params=='+req.query.id+'req.query== '
  +JSON.stringify(req.query))
 var id=req.query.id;
 var freq=['weekly', 'A_week', 'B_week', '_3weekly','_4weekly','Monthly'];
 var qry="SELECT s.id, s.stair, s.next_clean, c.cleaner,"+ 
            " s.freq, s.postcode, s.lat, s.lng, "+
        " DATE_FORMAT(s.next_clean, '%d %b %Y') AS date from stairlist AS s"+
        ' INNER JOIN cleaners AS c'+
        ' ON c.id=s.cleaner_id'+
         ' WHERE s.cleaner_id='+id+
         " ORDER BY s.stair;";
 console.log('qry=='+qry)
 connection.query(qry, function(err,rows){
          if(err) throw err;
       
      res.locals.all=true    
      res.render('cleaners',
        {id:id,name: rows[0].cleaner, freq:freq, rows:rows, user:req.session.email })
      //res.send(rows)      
          
            });//connection
// res.end('hellotest')
 //res.render('index')
})

/////// select cleaner from dropdown menu ////
///// reneders cleaner.ejs with cleaner data ////
router.get('/:id', getWeek,function(req,res){
	console.log('in router claeners name id'+req.params.id)
  var id=req.params.id
	
    var freq=['weekly', 'A_week', 'B_week', '_3weekly','_4weekly','Monthly'];

     var qry="SELECT s.id, s.stair, s.next_clean, c.cleaner, s.freq, s.postcode, s.lat, s.lng, "+
     		" DATE_FORMAT(s.next_clean, '%d %b %Y') AS date from stairlist AS s"+
        ' INNER JOIN cleaners AS c'+
        ' ON c.id=s.cleaner_id'+
     		 " WHERE s.cleaner_id="+id+" && s.freq !="+req.isNot+
         " && (s.next_clean<"+req.end_of_week+
         " || s.next_clean IS NULL)"+
         " ORDER BY s.stair;";

     console.log('qry='+qry)
     
     connection.query(qry, function(err,rows){
          if(err) throw err;
       
      res.locals.all=false  	
			res.render('cleaners',
        {id:id,name: rows[0].cleaner, freq:freq, rows:rows, user:req.session.email })
            
          
            });//connection

});




module.exports = router;