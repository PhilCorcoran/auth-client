process.env.DEBUG=process.env.DEBUG || "auth-client*";

const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const debug = require('debug')('auth-client:test-angXSRF');

describe('Test angXSRF', () => {
    before(()=>{
        debug('start')
    });

    after(()=>{
        debug('end')
    });

    it('angXSRF success', (done) => {
        const req = {
            get: ()=>{ return undefined},
            cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'},
            header : (name)=>{return name === 'X-XSRF-TOKEN' ? 'XSRF-VALUE' : undefined}
        }


        const res = {}
        auth.angXSRF()(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('angXSRF failure - header missing', (done) => {
        const req = {
            get: ()=>{ return undefined},
            cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'}
        }
        req.header = req.get; // express aliases header to get

        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 401, 'statusCode must be 401');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL, 'check location');
                assert.strictEqual(res.message, 'XSRF error');
                assert.strictEqual(res.status, 'ERROR');
                done();
            }
        }

        auth.angXSRF()(req,res,(err)=>{
            assert.fail ('next callback should not be called')
            done();
        })
    })

    it('angXSRF failure - header mismatch', (done) => {
        const req = {
            cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'},
            get : (name)=>{return name === 'X-XSRF-TOKEN' ? 'INVALID_VALUE' : undefined}
        }
        req.header = req.get; // express aliases header to get
        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 401, 'statusCode must be 401');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL, 'check location');
                assert.strictEqual(res.message, 'XSRF error');
                assert.strictEqual(res.status, 'ERROR');
                done();
            }
        }

        auth.angXSRF()(req,res,(err)=>{
            assert.fail ('next callback should not be called')
            done();
        })
    })

    it('angXSRF failure - header mismatch - noRespond', (done) => {
        const req = {
            cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'},
            get : (name)=>{return name === 'X-XSRF-TOKEN' ? 'INVALID_VALUE' : undefined}
        }
        req.header = req.get; // express aliases header to get
        const res = {
            status : (statusCode)=>{
                assert.strictEqual(statusCode, 401, 'statusCode must be 401');
                return res;
            },
            send : (res)=>{
                assert.ok(res, 'res defined')
                assert.strictEqual(res.location,  config.server.authURL, 'check location');
                assert.strictEqual(res.message, 'XSRF error');
                assert.strictEqual(res.status, 'ERROR');
                done();
            }
        }

        auth.angXSRF(true)(req,res,(err)=>{
            assert.ok(err instanceof Error, 'isError')
            assert.strictEqual(err.message, 'XSRF Error', 'check error message')
            done();
        })
    })

    it('angXSRF success - API Key', (done) => {
        const req = {
            get: (header)=>{
                const valid = {Authorization : 'Bearer TEST_TOKEN'}
                valid['X-Api-Key'] = 'TEST_API_KEY';
                return valid[header];
            },
            //cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'},
            //header : (name)=>{return name === 'X-XSRF-TOKEN' ? 'XSRF-VALUE' : undefined}
        }
        req.header = req.get; // express aliases header to get
        const res = {}
        auth.angXSRF()(req,res,(err)=>{
            assert.ok(err === undefined, 'err undefined')
            done();
        })
    })

    it('angXSRF failure - API Key - invalid token', (done) => {
        const req = {
            get: (header)=>{
                const valid = {Authorization : 'Bearer TEST_TOKEN'}
                valid['X-Api-Key'] = 'WRONG_API_KEY';
                debug('header ', header, valid[header])
                return valid[header];
            },
            //cookies : {'XSRF-TOKEN' : 'XSRF-VALUE'},
            //header : (name)=>{return name === 'X-XSRF-TOKEN' ? 'XSRF-VALUE' : undefined}
        }
        req.header = req.get; // express aliases header to get
        const res = {}
        auth.angXSRF(true)(req,res,(err)=>{
            assert.ok(err instanceof Error, 'isError')
            assert.strictEqual(err.message, 'XSRF Error', 'check error message')
            done();
        })
    })

});