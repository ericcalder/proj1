var express = require('express');
var router = express.Router();

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
/*
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GEO_CODE_API_KEY, // for Mapquest, OpenCage, Google Premier
  zoom: 13         // 'gpx', 'string', ...
};
 
var geocoder = NodeGeocoder(options);
*/
////////////////////////////////////////
////////// middleware
const getData=(req,res, next)=>{
	
	console.log('in getData');
	var qry='SELECT s.id, s.stair,s.cleaner_id, c.cleaner, s.freq, s.next_clean,'+
			' DATE_FORMAT(s.next_clean,'+'"%d-%b-%Y"'+') AS nicedate,'+
			' DATE_FORMAT(s.next_clean,'+'"%Y-%m-%d"'+') AS sqldate'+
			' FROM stairlist AS s'+
			' INNER JOIN cleaners AS c'+
			' ON c.id=s.cleaner_id'+
			//' WHERE s.cleaner_id<3'+
			' ORDER BY s.stair;';
			//' LIMIT 60;';
			console.log('qry++++++++++++++'+qry)
	connection.query(qry, function(error, rows) {
		if (rows.length > 0) {
					/*req.session.loggedin = true;
					req.session.authenticated = true;
					req.session.email = email;
					*/
					//console.log('results='+JSON.stringify(rows))
					rows.forEach(function(row){
						console.log('foreach==='+row.stair+'  '+row.id)
						var freq_arr=['weekly', 'A_week', 'B_week', '_3weekly','_4weekly','Monthly'];
						row.freq_str=freq_arr[row.freq]
						row.next_clean_str=row.nicedate
					
					})
					req.rows=rows;
		next();
		}
		 else {
		 	console.log('no results for login')
				res.render('login',{message:'Incorrect Username and/or Password!'})
				//res.send('Incorrect Username and/or Password!');
			}
	});//connection
}//getData
//////////////////////   geocode middleware ////
/*
const geocode=async function(req,res,next){
console.log('in geocod')
console.log('req.query='+JSON.stringify(req.query)+
		' id=  '+req.query.stair_id+'    '+req.query.stair)
//req.address=req.query.row.stair
req.id=req.query.stair_id
req.address=req.query.stair;
console.log('req.address++++'+req.address)
 await geocoder.geocode(req.address+' edinburgh', function(err, res) {
  	console.log('res=='+JSON.stringify(res))
  console.log(res[0].formattedAddress);
  console.log('postcode==='+res[0].zipcode);
  req.postcode=res[0].zipcode
  req.lat=res[0].latitude
  req.lng=res[0].longitude
	});
next();
}
*/
////////////////////////////////////////

router.get('/', getData, function(req,res){
	console.log('in router edit')

res.render('edit',{user:req.session.email, rows:req.rows})

})

router.post('/form_add',function(req, res){
		console.log('in router form_update')
	console.log('req.body.arr=='+req.body.arr)
	console.log('parse=='+JSON.parse(req.body.arr))
	var vals=JSON.parse(req.body.arr)
	if(vals[3].value){
	var qry="INSERT INTO stairlist"+
			" (stair, postcode, freq, next_clean, cleaner_id)"+
			" VALUES ('"+vals[0].value+"', '"+
				vals[1].value+"', "+vals[2].value+
				", STR_TO_DATE('"+vals[3].value+"','%Y-%m-%d')"+
				", "+vals[4].value+");";
				}//if
	else{
		var qry="INSERT INTO stairlist"+
			" (stair, postcode, freq, cleaner_id)"+
			" VALUES ('"+vals[0].value+"', '"+
				vals[1].value+"', "+vals[2].value+
				", "+vals[4].value+");";
	}
	console.log('qry+++'+qry)
	connection.query(qry, function(err,result,fields){
          if(err) throw err;
           
            console.log('result=='+JSON.stringify(result)+'   '+result.changedRows)
                res.send(result)
            });//connection		
	//res.send(vals)
})


router.post('/form_update', function(req,res){
	console.log('in router form_update')
	console.log('req.body.arr=='+req.body.arr)
	console.log('parse=='+JSON.parse(req.body.arr))
	var vals=JSON.parse(req.body.arr)
	console.log('vals[0]='+vals[0].name)
	if(vals[2].value){
	var qry="UPDATE stairlist"+
			" SET freq="+vals[1].value+
				", cleaner_id="+vals[3].value+
				", next_clean=STR_TO_DATE('"+vals[2].value+"','%Y-%m-%d')"+
				" WHERE id="+vals[0].value+";";
			}
	else {
		var qry="UPDATE stairlist"+
			" SET freq="+vals[1].value+
				", cleaner_id="+vals[3].value+
				" WHERE id="+vals[0].value+";";
	}
	console.log('qry='+qry)
	connection.query(qry, function(err,result,fields){
          if(err) throw err;
           
            console.log('result=='+JSON.stringify(result)+'   '+result.changedRows)
                res.send(result)
            });//connection
//res.end();
	})

router.get('/delete', function(req, res){
	console.log('in delete')
	console.log('req.query.stair_id='+req.query.stair_id)
	
	
	var qry=" DELETE from stairlist"+
			" WHERE id="+req.query.stair_id+";";
	console.log('qry='+qry);
	
	connection.query(qry, function(err,result,fields){
          if(err) throw err;
           
            console.log('result=='+JSON.stringify(result)+'   '+result.changedRows)
                res.send(result)
            });//connection
            
	//res.end('delete')
	
})
/*
router.get('/latlng', geocode, function(req, res){
	console.log('in router latlng')
	console.log('req.query.stair_id='+req.query.stair_id)
	console.log('latlng==='+req.lat+'  '+req.lng)
	var qry= 'Update stairlist SET lat='+req.lat+
				' ,lng='+req.lng+',postcode='+'"'+req.postcode+'"'+
				' WHERE id='+req.id+';' 
	console.log('qry=='+qry)
	connection.query(qry, function(err,result,fields){
          if(err) throw err;
           
            console.log('result=='+JSON.stringify(result)+'   '+result.changedRows)
                res.send(result)
            });//connection
	//res.end();
});
*/
module.exports = router;
