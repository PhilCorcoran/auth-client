const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const nock = require('nock');
const debug = require('debug')('auth-client:test-keepAlive');

const SERVER = 'http://localhost';

describe('Test keepalive', () => {

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

    it('keepalive 1', (done) => {
        nock(SERVER)
        .post('/keepalive', {access_token : 'test_token'})
        .reply(200, {status : 'OK'});

        const req = { access_token : 'test_token' }
        const res = {}
        auth.keepAlive()(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('keepalive with cookies', (done) => {
        nock(SERVER)
        .post('/keepalive', {access_token : 'test_token'})
        .reply(200, {status : 'OK'});

        const req = {
            cookies : {access_token : 'test_token' }
        }
        const res = {}
        auth.keepAlive()(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

   it('keepalive no token', (done) => {
        //.reply(200, {status : 'OK'});

        const req = {}
        const res = {}
        auth.keepAlive()(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })
});