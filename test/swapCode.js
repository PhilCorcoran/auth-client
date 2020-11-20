const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const nock = require('nock');
const debug = require('debug')('auth-client:test-swapcode');

const SERVER = 'http://localhost';

function extendRequest(req){

}

describe('Test swapCode', () => {
    before(()=>{
        debug('start')
        nock.emitter.on('no match', req => {
            debug('unexpected request', req.method, req.path)
            assert.fail('unexpected request')
        })
    });

    after(()=>{
        debug('end')
    });

    beforeEach(()=>{
        nock.cleanAll();
    })

    afterEach(()=>{
        assert.ok(nock.isDone(), 'All Done');
    })

    it('swapCode no code', (done) => {
        const options = {
            noRespond: false,
            scope : 'testScope',
        }

        const req = {}
        const res = {}
        auth.swapCode(options)(req,res,(err)=>{
            debug('swapCode noCode callback', err)
            assert.ok(err === undefined, 'err undefined')
            assert.ok(req[config.tokenName] === undefined, 'no token set')
            done()
        })
    })

    it('swapCode no code empty params', (done) => {
        const options = {
            noRespond: false,
            scope : 'testScope',
        }

        const req = { params : {}}
        const res = {}
        auth.swapCode(options)(req,res,(err)=>{
            debug('swapCode noCode callback', err)
            assert.ok(err === undefined, 'err undefined')
            assert.ok(req[config.tokenName] === undefined, 'no token set')
            done()
        })
    })

    it('swapCode using params', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeUsingParams',
                value: 'testCode'
            }
        })
        .reply(200, {session : {token : 'testToken'}});

        const options = {
            noRespond: false,
            scope : 'testScopeUsingParams',
        }

        const req = { params : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                debug('cookie', name, value)
                if(name === config.tokenName) {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else if(name === 'XSRF-TOKEN') {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else {
                    assert.fail ('unexpected cookie ' + name)
                }
            },
            send  : msg =>{assert.strictEqual(msg, 'swapped the code', 'result sent'); done();}
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.fail ('next callback shooudl not be called')
        })

    })

    it('swapCode using body', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeUsingBody',
                value: 'testCode'
            }
        })
        .reply(200, {session : {token : 'testToken'}});

        const options = {
            noRespond: false,
            scope : 'testScopeUsingBody',
        }

        const req = { body : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                debug('cookie', name, value)
                if(name === config.tokenName) {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else if(name === 'XSRF-TOKEN') {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else {
                    assert.fail ('unexpected cookie ' + name)
                }
            },
            send  : msg =>{assert.strictEqual(msg, 'swapped the code', 'result sent'); done();}
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.fail ('next callback shooudl not be called')
        })

    })

    it('swapCode using query', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeUsingQuery',
                value: 'testCode'
            }
        })
        .reply(200, {session : {token : 'testToken'}});

        const options = {
            noRespond: false,
            scope : 'testScopeUsingQuery',
        }

        const req = { body : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                debug('cookie', name, value)
                if(name === config.tokenName) {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else if(name === 'XSRF-TOKEN') {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else {
                    assert.fail ('unexpected cookie ' + name)
                }
            },
            send  : msg =>{assert.strictEqual(msg, 'swapped the code', 'result sent'); done();}
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.fail ('next callback shooudl not be called')
        })

    })

    it('swapCode using noRespond option', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeNoRespond',
                value: 'testCode'
            }
        })
        .reply(200, {session : {token : 'testToken'}});

        const options = {
            noRespond: true,
            scope : 'testScopeNoRespond',
        }

        const req = { params : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                debug('cookie', name, value)
                if(name === config.tokenName) {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else if(name === 'XSRF-TOKEN') {
                    assert.strictEqual(value, 'testToken', 'Cookie set to correct value')
                }
                else {
                    assert.fail ('unexpected cookie ' + name)
                }
            },
            send  : msg =>{ assert.fail ('unexpected send ' + name)}
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.ok(req[config.tokenName] !== undefined, 'token set')
            done()
        })

    })

    it('swapCode empty response', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeEmptyRepsonse',
                value: 'testCode'
            }
        })
        .reply(200, {});

        const options = {
            noRespond: true,
            scope : 'testScopeEmptyRepsonse',
        }

        const req = { params : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                 assert.fail ('unexpected cookie ' + name)
            },
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 503, 'statusCode must be 503');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'No user session for code')
                done();
            }
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.fail('next callback should not be called')
        })

    })

    it('swapCode service error', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeEmptyRepsonse',
                value: 'testCode'
            }
        })
        .replyWithError('Service Error');

        const options = {
            noRespond: true,
            scope : 'testScopeEmptyRepsonse',
        }

        const req = { params : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                 assert.fail ('unexpected cookie ' + name)
            },
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 503, 'statusCode must be 503');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'Failed to exchange code')
                done();
            }
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.fail('next callback should not be called')
        })

    })

    it('swapCode 5xx error', (done) => {

        nock(SERVER)
        .post('/swapCode', {
            requestToken: {
                name: 'testScopeEmptyRepsonse',
                value: 'testCode'
            }
        })
        .reply(500, {error: "Some Error"});

        const options = {
            noRespond: true,
            scope : 'testScopeEmptyRepsonse',
        }

        const req = { params : { code : 'testCode'}}
        const res = {
            cookie : (name, value) => {
                 assert.fail ('unexpected cookie ' + name)
            },
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 503, 'statusCode must be 503');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'Failed to exchange code')
                done();
            }
        }
        auth.swapCode(options)(req,res,(err)=>{
            assert.fail('next callback should not be called')
        })

    })

    it('swapCode no scope', (done) => {
        const options = {
            noRespond: true,
            scope : undefined,
        }

        try{
            auth.swapCode(options);
        } catch(err){
            done();
            return;
        }
        assert.fail('swapCode should have thrown exception')

    })
});




