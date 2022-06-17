const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('Create an issue with every field: POST request', function (done) {
    
        done();
    })  
    test('Create an issue with only required fields: POST request', function (done) {
    
        done();
    })  
    test('Create an issue with missing required fields: POST request', function (done) {
    
        done();
    })  
    test('View issues on a project: GET request', function (done) {
    
        done();
    })  
    test('View issues on a project with one filter: GET request', function (done) {
    
        done();
    })  
    test('View issues on a project with multiple filters: GET request', function (done) {
    
        done();
    })  
    test('Update one field on an issue: PUT request', function (done) {
    
        done();
    })  
    test('Update multiple fields on an issue: PUT request', function (done) {
    
        done();
    })  
    test('Update an issue with missing _id: PUT request', function (done) {
    
        done();
    })  
    test('Update an issue with no fields to update: PUT request', function (done) {
    
        done();
    })  
    test('Update an issue with an invalid _id: PUT request', function (done) {
    
        done();
    })
    test('Delete an issue: DELETE request', function (done) {
    
        done();
    })
    test('Delete an issue with an invalid _id: DELETE request', function (done) {
    
        done();
    })
    test('Delete an issue with missing _id: DELETE request', function (done) {

        done();
    })
});
