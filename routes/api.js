'use strict';


module.exports = function (app) {
  const mongo = require('mongodb')
  const mongoose = require('mongoose')
  const mySecret = process.env.MONGO_URI

  mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

  const newIssueSchema = new mongoose.Schema({
    project: String,
    issue_title: String,
    issue_text: String,
    created_on: String,
    updated_on: String,
    created_by: String,
    assigned_to: String,
    open: Boolean,
    status_text: String
  }, { strict: false, versionKey: false })

  const Issue = mongoose.model('Issue', newIssueSchema);
  Issue.events.on('error', err => console.log(err.message));

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      // Data filter
      let filter = {
        project: project
      }
      
      // Check for query filtering
      if(Object.keys(req.query).length > 0) {
        filter = {
          project: project,
          ...req.query
        }
      }      

      // Find issues for project
      Issue.find({
        ...filter
      }, (err, data) => {
        if(err) return console.log("Error:\n" + err)
        res.json(data)
      // Hide project field
      }).select({ project: 0 })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      
      // Throw error if missing required fields
      if (issue_title === undefined || issue_text === undefined || created_by === undefined) {
        return res.json({ error: "required field(s) missing" })
      }

      // Submits new Issue to database
      const newIssue = new Issue({
        issue_title: issue_title,
        issue_text: issue_text,
        created_on: (new Date()).toISOString(),
        updated_on: (new Date()).toISOString(),
        created_by: created_by,
        assigned_to: req.body.assigned_to != undefined ? req.body.assigned_to : "",
        open: true,
        status_text: req.body.status_text != undefined ? req.body.status_text : ""
      });
      // Assign project property; defaults to _id if project param not provided
      newIssue.project = project != undefined ? project : newIssue._id;

      // Save new Issue document
      newIssue.save(function(err, data) {
        if (err) return console.error('Problem saving new issue')
      });
      // Send data back to client
      res.json({
        assigned_to: newIssue.assigned_to,
        created_by: newIssue.created_by,
        created_on: newIssue.created_on,
        issue_text: newIssue.issue_text,
        issue_title: newIssue.issue_title,
        open: newIssue.open,
        status_text: newIssue.status_text,
        updated_on: newIssue.updated_on,
        _id: newIssue._id
      })
    })
    
    .put(function (req, res){
      let update = req.body
      let id = req.body._id;

      function updateFieldsPresent() {
        let numberOfFields = 0
        Object.entries(update).forEach(([key, value]) => {
          value ? numberOfFields++ : null
        })
        return numberOfFields > 1 ? true : false
      }
      
      // Handle missing id error & missing fields error
      if (id === undefined) {
        return res.json({ error: "missing _id" })
      } else if (!updateFieldsPresent()) {
        return res.json({ error: "no update field(s) sent", _id: id })
      }

      // Locate Issue by id and update fields if data is provided
      Issue.findById(id, (err, data)=> {
        if (err || data === null) return res.json({ error: "could not update", _id: id })
        if (update.issue_title != undefined) { data.issue_title = update.issue_title }
        if (update.issue_text != undefined) { data.issue_text = update.issue_text }
        if (update.created_by != undefined) { data.created_by = update.created_by }
        if (update.status_text != undefined) { data.status_text = update.status_text }
        if (update.assigned_to != undefined) { data.assigned_to = update.assigned_to }
        if (update.open == 'false') { data.open = false }
        // Updated time logged
        data.updated_on = (new Date()).toISOString()
        // Save the updated document
        data.save((err, ok) => {
          if (err) return console.error(err)
          res.send({ result: "successfully updated", _id: id })
        })        
      })
    })
    
    .delete(function (req, res){
      let id = req.body._id;

      // Handle missing id error
      if (id === undefined) {
        return res.json({ error: "missing _id" })
      }

      // Locate Issue by id and delete
      Issue.findOneAndDelete({ _id: id }, (err, data) => {
        if (err || data === null) {
          return res.json({ error: "could not delete", _id: id })
        }
        res.json({ result: "successfully deleted", _id: id })
      })
    });
    
};
