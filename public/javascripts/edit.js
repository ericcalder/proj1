$( document ).ready(function(){


  var freq=['weekly', 'A_week', 'B_week', '_3weekly','_4weekly','Monthly'];
  var clist=JSON.parse(localStorage.getItem('cleaners'));
  
 ////////////////////////////////////////////////
 ////////////////  add new stait  ///////////////////////////
 $('#add_').on('show.bs.modal', function () {
  console.log('loaded modal')
  //var clist=$('body').data().cleaners
        
        populateAddForm(freq, clist)
        submitAddForm(freq, clist)
  
})

 
  selectRow(clist,freq);
  }); ///doc ready
 /////////////////////////////////////////
 //////    functions
 ///////////////////////////////////////
 function selectRow(clist, freq){
    $('.csv .table tbody tr').on('click', function(){
       
        var row=$(this).index()
        //popform(clist, freq, row);
      
        localStorage.setItem('row', row);
        localStorage.setItem('stair',$(this).find('td:eq(0)').text());
        localStorage.setItem('stairId',$(this).find('td:eq(4)').text());
        localStorage.setItem('cleaner',$(this).find('td:eq(2)').text());
        localStorage.setItem('freq',$(this).find('td:eq(6)').text());
        localStorage.setItem('sqldate',$(this).find('td:eq(5)').text());
        localStorage.setItem('cleaner_id',$(this).find('td:eq(7)').text());
        console.log('localStorage=='+JSON.stringify(localStorage))
        // puts stair into modal-body
        $('#edit_ .modal-body h3').empty()
        .append(localStorage.getItem('stair'));
        /// load values into input form /////
        // puts stair_id into input form @ eq(0)
       $('#edit_ .modal-body #target input:eq(0):text')
            .val(localStorage.getItem('stairId'));
        // puts next_clean (in yyyy/mm/dd format) @ eq(1)
        // has to be in this format to show up
       $('#edit_ .modal-body #target input:eq(1)')
       .val(localStorage.getItem('sqldate'));

        /////populate select frequency  //////////////////////////////
        // loads stair freq values into freq options
        $('#edit_ .modal-body #target select#freqselect').empty()
        for(k=0;k<freq.length;k++){
        $('#edit_ .modal-body #target select#freqselect')
            .append($('<option/>').val(k).text(freq[k]));
        }//for
        // loads cleaners into cleaners select options
        $('#edit_ .modal-body #target select#cleanerselect').empty()
        for(k=0;k<clist.length;k++){
        $('#edit_ .modal-body #target select#cleanerselect')
            .append($('<option/>').val(clist[k].id).text(clist[k].cleaner));
        }//f    
      /////////////////////////////////////////////////////
        ///// displays freq option
        $('#edit_ .modal-body #target select#freqselect')
        .val(localStorage.getItem('freq'))
        .prop("selected",true)
        //// displays cleaner in cleaner option
        $('#edit_ .modal-body #target select#cleanerselect')
          .val(localStorage.getItem('cleaner_id'))
          .prop("selected",true)
        

        $('#edit_').modal('show');//show form

////////// changes freq option when selected ////////////////////////////
        $('#edit_ .modal-body #target select#freqselect').on('change',function(){
          console.log(' opt='+$('select[id=freqselect]').val())  
        })

////////// changes cleaners option when selected ////////
        $('#edit_ .modal-body #target select#cleanerselect').on('change',function(){
          console.log(' opt='+$('select[id=cleanerselect]').val())  
        })
        ///////////////// delete stair button /////////
        ////////////////////////////////////////////////////////////
        $('div.modal-footer button.delete_stair').off().on('click', function(){
          console.log('in delete_stair====row==='+row)
          delete_stair(row); 
        })
        ////////////////////////////////////////////        
        ///////////////////////////////////////
        //////////////////    add latlng ///////////
        /*
        $('div.modal-footer button.add_latlng').off().on('click', function(){
          console.log('in add_latlng==='+row)
          add_latlng(row);

        })
        */
        ////////////////////////////////////////////
       submitForm(freq, clist, row);
        //////////////////////////////////////
       
        })//click

       
  }//selectRow



/*
  function add_latlng(row){
    console.log('in latlng')
    var stair_id=localStorage.getItem('stairId');
    var stair=localStorage.getItem('stair');
    $.get('edit/latlng',{stair: stair, stair_id:stair_id}, function(data){
             console.log('return data=='+data)
            })
    $('#edit_').modal('hide');//hide form
    return
  }
*/

  function delete_stair(row){
    console.log('in test')
    console.log('Stair-id===='+localStorage.getItem('stairId'))
          var stair_id=localStorage.getItem('stairId');
          var conf=confirm('delete stair id='+localStorage.getItem('stairId'));
          if(conf==true){
            console.log('in confirm')
            $.get('edit/delete',{stair_id:stair_id}, function(data){
              console.log('return data=='+data)
            })
          }
          else {
                console.log('cancel pressed')
                  
              }
      $('#edit_').modal('hide');//hide form
      refresh()
      //location.reload();/// refresh page
  }
  
  function submitForm(freq, clist, row){
    $('#target').unbind('submit').submit(function(e){
          console.log('in submit')
          var arr=$( this ).serializeArray();
          console.log( $( this ).serializeArray() );
          
          $.post('edit/form_update',{arr: JSON.stringify(arr)},function(data){
            console.log('in edit/form_update')
            console.log('data=='+'  '+data.changedRows+' '+JSON.stringify(data))
           
          })//post
          
          event.preventDefault();
          

          $('#edit_').modal('hide');//show form
          refresh()
          //location.reload();/// refresh page
          return
        })//submit

  }

function submitAddForm(freq, clist){
  $('#target_').submit(function(e){
          console.log('in submit add form')
          var arr=$( this ).serializeArray();
          console.log( $( this ).serializeArray() );
         
           $.post('edit/form_add',{arr: JSON.stringify(arr)},function(data){
            console.log('in edit/form_add')
            console.log('data=='+'  '+data.changedRows+' '+JSON.stringify(data))
           
          })//post
          
          alert('record added')
           //event.preventDefault();

        });//submit
  return;
}




function populateAddForm(freq, clist){
    
        /////populate select frequency  //////////////////////////////
        $('#add_ .modal-body #target_ select#freqselect').empty()
        for(k=0;k<freq.length;k++){
        $('#add_ .modal-body #target_ select#freqselect')
            .append($('<option/>').val(k).text(freq[k]));
        }//for    
      /////////////////////////////////////////////////////
      ///// populate cleaners /////
      //var clist=$('body').data().cleaners

        $('#add_ .modal-body #target_ select#cleanerselect').empty()
        for(k=0;k<clist.length;k++){
        $('#add_ .modal-body #target_ select#cleanerselect')
            .append($('<option/>').val(clist[k].id).text(clist[k].cleaner));
        }//for
        $('#add_ .modal-body #target_ select#freqselect').on('change',function(){
          console.log(' opt='+$('select[id=freqselect]').val())  
        })
        $('#add_ .modal-body #target_ select#cleanerselect').on('change',function(){
          console.log(' opt='+$('select[id=cleanerselect]').val())  
        })
        return
  }

  function refresh(){
    console.log('in refresh')
    $.get('/edit',function(data){
      console.log('in get /edit')
    })
    location.reload();/// refresh page
  }


  function mySqlToCsv(date){
    if(date){
  var month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DD=date.slice(8,10);
  var MM=date.slice(5,7);
  var mm=parseInt(MM);
  mm=month[mm-1];
  var YYYY=date.slice(2,4);
  return DD+'-'+mm+'-'+YYYY;
}
else{ return ''}
}

function sqlToDatepicker(mysqldate){
  if(mysqldate){
    var date=mysqldate.slice(0,11)
    console.log('sqlToDatepicker='+date)
    return date
  }
}

function datepickerDate(date){
 var month=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 if(date){
  var MM=month.indexOf(date.slice(3,6))+1
    if(MM<10){
      MM='0'+MM
    }
  var DD=date.slice(0,2)
  var YYYY=date.slice(7,11)
}
 return YYYY+'-'+MM+'-'+DD; 
}