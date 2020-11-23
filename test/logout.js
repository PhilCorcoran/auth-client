const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const nock = require('nock');
const debug = require('debug')('auth-client:test-logout');

const SERVER = 'http://localhost';

describe('Test logout', () => {
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
    });

    afterEach(()=>{
        assert.ok(nock.isDone(), 'All Done');
    })

    it('logout with token', (done) => {
        nock(SERVER)
        .post('/logout', {access_token : 'test_token'})
        .reply(200, {status : 'OK'});

        const req = { access_token : 'test_token' }
        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 200, 'statusCode must be 200');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'logout successful', 'check res value')
                done();
            }
        }
        auth.logout()(req,res,(err)=>{
            assert.fail ('next callback should not be called')
        })
    })

    it('logout with token in cookie', (done) => {
        nock(SERVER)
        .post('/logout', {access_token : 'test_token'})
        .reply(200, {status : 'OK'});

        const req = {
            cookies : {access_token : 'test_token' }
        }
        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 200, 'statusCode must be 200');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'logout successful', 'check res value')
                done();
            }
        }
        auth.logout()(req,res,(err)=>{
            assert.fail ('next callback should not be called')
        })
    })

    it('logout with no token', (done) => {

        const req = {}
        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 200, 'statusCode must be 200');
                return res;
            },
            send : (res)=>{
                assert.strictEqual(res, 'logout successful', 'check res value')
                done();
            }
        }
        auth.logout()(req,res,(err)=>{
            assert.fail ('next callback should not be called')
        })
    })

    it('logout with token - no respond', (done) => {
        nock(SERVER)
        .post('/logout', {access_token : 'test_token'})
        .reply(200, {status : 'OK'});

        const req = { access_token : 'test_token' }
        const res = {
            status : (statusCode)=>{
                assert.fail ('status should not be called')
            },
            send : (res)=>{
                assert.fail ('send should not be called');
            }
        }
        auth.logout({noRespond: true})(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })
});