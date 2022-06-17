'use strict';


module.exports = function (app) {
  const mongo = require('mongodb')
  const mongoose = require('mongoose')
  const mySecret = process.env.MONGO_URI

  mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true });

  const newIssueSchema = new mongoose.Schema({
    issue_title: String,
    issue_text: String,
    created_on: String,
    updated_on: String,
    created_by: String,
    assigned_to: String,
    open: Boolean,
    status_text: String
  }, { strict: false , versionKey: false })

  const Issue = mongoose.model('Issue', newIssueSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      try {
        let project = req.params.project;
        const getProject = Issue.findById({_id: project}, (err, data) => {
          res.send(data);
        })
      } catch (error) {
        console.error(error.message)
      }
    })
    
    .post(function (req, res){
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      if (issue_title === undefined || issue_text === undefined || created_by === undefined) {
        return res.json({ error: "required field(s) missing" })
      }
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

      newIssue.save(function(err, data) {
        if (err) return console.error('Problem saving new issue')
      });

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
      let project = req.body._id;
      if (update === undefined) {
        res.json({ error: "no update field(s) sent", _id: project })
      }    
      const updateIssue = Issue.findById(project, (err, data)=> {
        if (err || data === null) return res.json({ error: "could not update", _id: project })
        if (update.issue_title != '') { data.issue_title = update.issue_title }
        if (update.issue_text != '') { data.issue_text = update.issue_text }
        if (update.created_by != '') { data.created_by = update.created_by }
        if (update.status_text != '') { data.status_text = update.status_text }
        if (update.assigned_to != '') { data.assigned_to = update.assigned_to }
        if (update.open != '') { data.open = false }
        data.updated_on = (new Date()).toISOString()

        data.save((err, ok) => {
          if (err) return console.error(err)
          res.send({ result: "successfuly updated", _id: project })
        })        
      })
    })
    
    .delete(function (req, res){
      let project = req.body._id;
      if (project === undefined) {
        return res.json({ error: "missing _id" })
      }

      const deleteIssue = Issue.findOneAndDelete({ _id: project }, (err, data) => {
        if (err || data === null) {
          return res.json({ error: "could not delete", _id: project })
        }
        res.json({ result: "successfully deleted", _id: project })
      })

    });
    
};
