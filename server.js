const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
var excelbuilder = require('msexcel-builder-colorfix');
const app = express();

const DATA_FILE = path.join(__dirname, 'data.json');
const DATA_EVENTS_FILE = path.join(__dirname, 'events.json');
const DATA_PEOPLE_FILE = path.join(__dirname, 'people.json');

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/api/events', (req, res) => {
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

app.get('/api/people', (req, res) => {
  fs.readFile(DATA_PEOPLE_FILE, (err, data) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(JSON.parse(data));
  });
});

// app.get('/api/people/*', (req, res) => {
//   var query = req.params[0].toLowerCase();
//   // console.log(query);
//   fs.readFile(DATA_PEOPLE_FILE, (err, data) => {
//     if(data.length) {
//       var obj = JSON.parse(data);
//       for (var i = 0; i < obj.length; i++) {
//         var name = obj[i].name.toLowerCase();
//         // console.log(name);
//         if(!name.includes(query)) {
//           obj.splice(i,1);
//           i = i - 1;
//         }
//       }
//     }
//     // console.log(obj);
//     res.setHeader('Cache-Control', 'no-cache');
//     // res.json(JSON.parse(data));
//     res.json(obj);
    
//   });
// });

app.get('/api/excel/events', (req, res) => {
  
  // Create workbook in working path
  var workbook = excelbuilder.createWorkbook('./public/excel', 'events.xlsx');

  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    const events = JSON.parse(data);
    fs.readFile(DATA_PEOPLE_FILE, (err, data) => {
      const people = JSON.parse(data);

      // create a sheet that has columns of events (+1) and the rows of people (+1)
      var sheet1 = workbook.createSheet('sheet1', (events.length + 1), (people.length+1));      

      // loop through events
      for(var i=0; i < events.length; i++) {
        // add event date to column
        sheet1.set(i+2, 1, events[i].date);
        // console.log(events[i]);
        // loop through people
        for(var j=0; j < people.length; j++) {
          // If this is the first event, add the person to the list
          if(i==1){
            sheet1.set(1, j+2, people[j].name);
          }
          // Check if event has any attendees
          if(events[i].hasOwnProperty('attendence')){

            // Set check to see if the current person went to event
            var attendee = false;

            // Loop through current event's attendence
            // if person is an attendee, add them else mark them missing
            for(var k=0; k < events[i].attendence.length; k++) {
              if (events[i].attendence[k].personId === people[j].id){
                attendee = true;
              }
            }
            if(attendee==true){
              sheet1.set(i+2, j+2, 'Yes');
              sheet1.fill(i+2, j+2, {type:'solid',fgColor:'FF00FF00',bgColor:'64'});
            } else {
              sheet1.set(i+2, j+2, 'No');
              sheet1.fill(i+2, j+2, {type:'solid',fgColor:'FFFF0000',bgColor:'64'});
            }
          // No attendees so set everyone to false
          } else {
            sheet1.set(i+2, j+2, 'No');
            sheet1.fill(i+2, j+2, {type:'solid',fgColor:'FFFF0000',bgColor:'64'});
          }
        }
      }
        
      // loop through people and add them to sheet
      


      // Put stuff in it
      // sheet1.set(1, 1, 'I am title');
      // for (var i = 2; i < 5; i++) {
      //   sheet1.set(i, 1, 'tests'+i);
      // }

      // Save it
      workbook.save(function(err){
        if(err) {
          throw err;
        } else {
          // res.sendfile('./public/excel/sample.xlsx');
          res.sendFile(path.join(__dirname, './public/excel', 'events.xlsx'));
        }
      });

    });
  });
});

app.post('/api/events', (req, res) => {
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    const events = JSON.parse(data);
    const newEvent = {
      title: req.body.title,
      date: req.body.date,
      id: req.body.id,
      attendence: req.body.attendence,
    };
    events.push(newEvent);
    fs.writeFile(DATA_EVENTS_FILE, JSON.stringify(events, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(events);
    });
  });
});

// app.get('/api/people', (req, res) => {
//   fs.readFile(DATA_PEOPLE_FILE, (err, data) => {
//     res.setHeader('Cache-Control', 'no-cache');
//     res.json(JSON.parse(data));
//   });
// });


app.put('/api/events', (req, res) => {
  // console.log('app.put');
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    const events = JSON.parse(data);
    events.forEach((event) => {
      if (event.id === req.body.id) {
        event.title = req.body.title;
        event.date = req.body.date;
        event.attendence = req.body.attendence;
      }
    });
    fs.writeFile(DATA_EVENTS_FILE, JSON.stringify(events, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json({});
      res.end();
    });
  });
});

app.put('/api/people', (req, res) => {
  // console.log('/api/people');
  // console.log(req.body);
  fs.readFile(DATA_PEOPLE_FILE, (err, data) => {
    const people = JSON.parse(data);
    const newPerson = {
      name: req.body.name,
      familyGroup: req.body.familyGroup,
      id: req.body.id,
    };
    people.push(newPerson);
    fs.writeFile(DATA_PEOPLE_FILE, JSON.stringify(people, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json(people);
    });
  });
});


app.put('/api/events/attendee', (req, res) => {
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    // Assign events
    const events = JSON.parse(data);
    // console.log(events);
    // console.log(req.body.person);
    events.forEach((event) => {
      if(event.id === req.body.id) {
        if(event.attendence === undefined) {
          var attendence = [];
          attendence.push(req.body.person);
          event.attendence=attendence;
        } else {
          event.attendence.push(req.body.person);
        }
      }
    });
    fs.writeFile(DATA_EVENTS_FILE, JSON.stringify(events, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json({});
      res.end();
    });
  });
});
/*
app.put('/api/events/attendee', (req, res) => {
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    // Assign events
    const events = JSON.parse(data);

    // Get people
    fs.readFile(DATA_PEOPLE_FILE), (err, pdata) => {
      // Assign People
      const people = JSON.parse(pdata);
      
      events.forEach((event) => ){
        if(event.id === req.body.eventid){
          if(req.body.familyGroup != undefined) {
          
            // var familyGroup = [];
            for(var i = 0; i< people.length; i++) {
              if(event.familyGroup === people[i].familyGroup){
                // familyGroup.push(people[i]);
                var attendee = {};
                attendee.personId = people[i].id;
                attendee.name = people[i].name;
                // person.id = people[i].id;
                eventid.attendence.push(people[i]);
              }
            }
          }
        } else {

        }
        
      }
    }
  }
}
*/
app.delete('/api/events/attendee', (req, res) => {
  // console.log('here');
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    let events = JSON.parse(data);
    events = events.reduce((memo, event) => {
      // console.log('memo '+memo);
      if (event.id === req.body.id) {
        if(event.attendence != undefined){
          for(var i=0;i<event.attendence.length;i++){
            if(event.attendence[i].personId===req.body.personId) {
              event.attendence.splice(i, 1);
            }
          }
        }
        return memo.concat(event);
      } else {
        return memo.concat(event);
      }
    }, []);
    fs.writeFile(DATA_EVENTS_FILE, JSON.stringify(events, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json({});
      res.end();
    });
  });
});

app.delete('/api/events', (req, res) => {
  fs.readFile(DATA_EVENTS_FILE, (err, data) => {
    let events = JSON.parse(data);
    events = events.reduce((memo, event) => {
      if (event.id === req.body.id) {
        return memo;
      } else {
        return memo.concat(event);
      }
    }, []);
    fs.writeFile(DATA_EVENTS_FILE, JSON.stringify(events, null, 4), () => {
      res.setHeader('Cache-Control', 'no-cache');
      res.json({});
      res.end();
    });
  });
});



// app.get('/molasses', (_, res) => {
//   setTimeout(() => {
//     res.end();
//   }, 5000);
// });

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
