const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const route = '/api/issues/:project';
const chaiWaitFor = require('chai-wait-for');
const { expect } = require('chai');
chai.use(chaiWaitFor);
chai.use(chaiHttp);

const waitFor = chaiWaitFor.bindWaitFor({
    // If no assertion attempt succeeds before this time elapses (in milliseconds), the waitFor will fail.
    timeout: 5000,
    // If an assertion attempt fails, it will retry after this amount of time (in milliseconds)
    retryInterval: 100,
  })

const issueKeys = ['issue_text', 'issue_title', 'created_by', 'created_on', 'assigned_to',
 'status_text', 'open', 'updated_on', '_id']

suite('Functional Tests', function() {
    this.timeout(10000)
    //1
    test('Create an issue with every field: POST request', function (done) {
        chai.request(server)
        .post(route)
        .send({
            issue_title: "A",
            issue_text: "B",
            created_by: "C",
            assigned_to: "D",
            status_text: "E"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body, issueKeys)
            done();
        })        
    });

    //2
    test('Create an issue with only required fields: POST request', function (done) {
        chai.request(server)
        .post(route)
        .send({
            issue_title: "test",
            issue_text: "test12",
            created_by: "test123"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body, issueKeys)
            done();
        })    
    });

    //3
    test('Create an issue with missing required fields: POST request', function (done) {
        chai.request(server)
        .post(route)
        .send({
            issue_title: "Missing issue_text and created_by"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.throws(()=> err.message = { "error": "required field(s) missing" })
            done();
        })    
    });

    //4
    test('View issues on a project: GET request', function (done) {
        chai.request(server)
        .get('/api/issues/apitest')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body[0], issueKeys)
            done();
        })    
    });

    //5
    test('View issues on a project with one filter: GET request', function (done) {
        chai.request(server)
        .get('/api/issues/apitest?assigned_to=Filter1')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body[0], issueKeys)
            assert.equal(res.body[0].assigned_to, "Filter1")
            done();
        })    
    });

    //6
    test('View issues on a project with multiple filters: GET request', function (done) {
        chai.request(server)
        .get('/api/issues/apitest?assigned_to=Filter2&status_text=Filter2')
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body[0], issueKeys)
            assert.equal(res.body[0].assigned_to, "Filter2")
            assert.equal(res.body[0].status_text, "Filter2")
            done();
        })    
    });

    //7
    test('Update one field on an issue: PUT request', function (done) {
        let id = "62ace1af115f0f33d40e79be"
        let compareArray = [];
        // record initial value of get request into array; originally "1"
        chai.request(server)
        .get('/api/issues/apitest?_id=62ace1af115f0f33d40e79be')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            compareArray.push(res.body[0].issue_text)
        });
        // make the put request; adds value of 1 to the issue_text initial value
        chai.request(server)
        .put(route)
        .send({
            _id: id,
            issue_text: (parseInt(compareArray[0])+1).toString()
        })
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully updated")
            assert.equal(res.body._id, id)
        })
        // GET the issue_text value again, and compare to stored value
        chai.request(server)
        .get('/api/issues/apitest?_id=62ace1af115f0f33d40e79be')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            waitFor(compareArray[0]).to.not.equal(res.body[0].issue_text)
            
        });
        done();
    });

    //8
    test('Update multiple fields on an issue: PUT request', function (done) {
        let id = "62ace1af115f0f33d40e79be"
        let compareArray1 = [];
        let compareArray2 = [];
        // record initial value of get request into array; originally "1"
        chai.request(server)
        .get('/api/issues/apitest?_id=62ace1af115f0f33d40e79be')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            compareArray1.push(res.body[0].issue_text)
            compareArray2.push(res.body[0].status_text)
        });
        // make the put request; adds value of 1 to the issue_text initial value
        chai.request(server)
        .put(route)
        .send({
            _id: id,
            issue_text: (parseInt(compareArray1[0])+1).toString(),
            status_text: (parseInt(compareArray2[0])+1).toString()
        })
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.body.result, "successfully updated")
            assert.equal(res.body._id, id)
        })
        // GET the issue_text value again, and compare to stored value
        chai.request(server)
        .get('/api/issues/apitest?_id=62ace1af115f0f33d40e79be')
        .end(function (err, res) {
            assert.equal(res.status, 200)
            waitFor(compareArray1[0]).to.not.equal(res.body[0].issue_text)
            waitFor(compareArray2[0]).to.not.equal(res.body[0].status_text)
        });
        done();
    });

    //9
    test('Update an issue with missing _id: PUT request', function (done) {
        chai.request(server)
        .put(route)
        .send({
            created_by: "missingID"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.throws(()=> err.message = { "error": "missing _id" })
            done();
        })    
    });

    //10
    test('Update an issue with no fields to update: PUT request', function (done) {
        let id = "62ace1af115f0f33d40e79be"

        chai.request(server)
        .put(route)
        .send({
            _id: id,
        })
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.throws(()=> err.message = { "error": "no update field(s) sent", "_id": id })
            done();
        })    
    });

    //11
    test('Update an issue with an invalid _id: PUT request', function (done) {
        let id = "apples"
        // apples is not a valid id
        chai.request(server)
        .put(route)
        .send({
            _id: id,
            open: false
        })
        .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.throws(()=> err.message = { "error": "could not update", "_id": id })
            done();
        })    
    });

    //12
    test('Delete an issue: DELETE request', function (done) {
        let tempid;
        // first, post a new issue
        chai.request(server)
        .post('/api/issues/testdelete')
        .send({
            issue_title: "test",
            issue_text: "test12",
            created_by: "test123"
        })
        .end(function (err, res) {
            // assign tempid from response
            tempid = res.body._id
            assert.equal(res.status, 200);
            assert.containsAllKeys(res.body, issueKeys)
        })
    
        // delete the newly created issue
        chai.request(server)
        .delete('/api/issues/testdelete')
        .send({
            _id: tempid
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            waitFor(res.body).to.equal({ "result": "successfully deleted", "_id": tempid })
            
        })
        done();
    });
    
    //13
    test('Delete an issue with an invalid _id: DELETE request', function (done) {
        let id = "bananas"
        chai.request(server)
        .delete(route)
        .send({
            _id: id
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.throws(()=> err.message = { "error": "could not delete", "_id": id })
        })
        done();
    });

    //14
    test('Delete an issue with missing _id: DELETE request', function (done) {
        chai.request(server)
        .delete(route)
        .send({
            issue_title: "no _id here"
        })
        .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.throws(()=> err.message = { "error": "missing _id" })
            done();
        })      
    });
});
