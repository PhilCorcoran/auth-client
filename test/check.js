const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const nock = require('nock');
const debug = require('debug')('auth-client:test-check');

const SERVER = 'http://localhost';

describe('Test check', () => {
    before(()=>{
        debug('start')
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

    it('check no token', (done) => {
        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : false,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined}
        }
        const res = {
            locals : {},
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 401, 'statusCode must be 401');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check location')
                assert.strictEqual(res.message, 'No token', 'check message')
                done();
            }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.fail('next callback should not be called')
        })

    })

    it('check no token with redirect', (done) => {
        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined}
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{
                assert.strictEqual(redirectURL,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check redirectURL')
                done();
            }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.fail('next callback should not be called')
        })

    })

    it('check success - access token on req', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - access token on body ', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            body : {access_token : 'TEST_TOKEN' }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - access token on query ', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            query : {access_token : 'TEST_TOKEN' }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - access token on cookies', (done) => {
        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            cookies : {access_token : 'TEST_TOKEN' }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - access token on auth header ', (done) => {
        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y'});
        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: (header)=>{
                return {Authorization : 'Bearer TEST_TOKEN'}[header];
            }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - with client_request', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION', clientRequest : {testkey : "testValue"} })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN',
            client_request : {
                testkey : "testValue"
            }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - with no client_request', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION', clientRequest : {} })
        .reply(200, {authorised : 'Y'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : undefined
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN',
            client_request : {
                testkey : "testValue"
            }
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check success - with auth details result', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'Y', authDetails : { testProperty : 'testValue'}});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            assert.ok(req.client_request, 'client_request defined')
            assert.ok(req.client_request.authDetails, 'authDetails defined')
            assert.strictEqual(req.client_request.authDetails.testProperty, 'testValue', 'testProperty as expected')
            done();
        })
    })

    it('check not authorised ', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'N'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : false,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            redirect : (redirectURL)=>{ assert.fail('redirect should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 403, 'statusCode must be 403');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check location')
                assert.strictEqual(res.message, 'Error: User does not have the required role or permision', 'check message')
                done();
            }

        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check not authorised - redirect', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'N'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{
                assert.strictEqual(redirectURL,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check redirectURL')
                done();
            }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check not authorised - redirect - no URI', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {authorised : 'N'});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : undefined,
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: (name)=>{ return {host : 'TEST_HOST'}[name]},
            access_token : 'TEST_TOKEN',
            originalUrl : '/test_url',
            protocol : 'http'
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{
                assert.strictEqual(redirectURL,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=http://TEST_HOST/test_url', 'check redirectURL')
                done();
            }
        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check no authorised flag sent', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : false,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            cookies : {access_token : 'TEST_TOKEN' }
        }
        const res = {
            locals : {},
            redirect : (res)=>{assert.fail('redirect should not be called')},
            clearCookie : (cookieName =>{assert.strictEqual(cookieName, 'access_token')}),
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 401, 'statusCode must be 401');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check location')
                assert.strictEqual(res.message, 'No user session for user token', 'check message')
                done();
            }

        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check no authorised flag sent - redirect', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(200, {});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : true,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            send : (res)=>{ assert.fail('send should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            redirect : (redirectURL)=>{
                assert.strictEqual(redirectURL,  config.server.authURL + '?response_type=code&scope=TEST_SCOPE&client_id=test_client_id&redirect_uri=/redirect', 'check redirectURL')
                done();
            }

        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check service 503', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .reply(503, {});

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : false,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            redirect : (res)=>{ assert.fail('redirect should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 503, 'statusCode must be 503');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'Failed to authorize', 'check result')
                done();
            }

        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check service error', (done) => {

        nock(SERVER)
        .post('/userAuth', {token: 'TEST_TOKEN', resource: 'TEST_SCOPE',operation: 'TEST_OPERATION' })
        .replyWithError('error')

        const options = {
            operation : 'TEST_OPERATION',
            redirectLogin : false,
            redirectURI : '/redirect',
            scope : 'TEST_SCOPE',
            clientReq : 'client_request'
        }

        const req = {
            get: ()=>{ return undefined},
            access_token : 'TEST_TOKEN'
        }
        const res = {
            locals : {},
            redirect : (res)=>{ assert.fail('redirect should not be called') },
            clearCookie : (cookieName =>{assert.fail('clearCookie should not be called')}),
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 503, 'statusCode must be 503');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'Failed to authorize')
                done();
            }

        }
        auth.check(options)(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('check no scope', (done) => {
        const options = {
            scope : undefined,
        }

        try{
            auth.check(options);
        } catch(err){
            done();
            return;
        }
        assert.fail('check should have thrown exception')

    })

    it('check no redirectLogin or redirectBackURI', (done) => {
        const options = {
            scope : 'TEST_SCOPE',
        }

        try{
            auth.check(options);
        } catch(err){
            done();
            return;
        }
        assert.fail('check should have thrown exception')

    })

});




