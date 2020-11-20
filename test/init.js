process.env.DEBUG=process.env.DEBUG || "auth-client*";

const config = require('./config.json');
const assert = require('assert');
const auth = require('../lib/index');
const debug = require('debug')('auth-client:test-init');

describe('Test auth client init', () => {
    before(()=>{
        debug('start')
    });

    after(()=>{
        debug('end')
    });

    it('empty options', () => {
        try{
            const authTest = auth({});
            assert.fail('init of auth should fail')
        }
        catch(err){
            assert.strictEqual(err.message, 'server and client are required')
        }
    })

    it('no options', () => {
        try{
            const authTest = auth();
            assert.fail('init of auth should fail')
        }
        catch(err){
            assert.strictEqual(err.message, 'server and client are required')
        }
    })


    it('no client', () => {
        try{
            const authTest = auth({server : {}});
            assert.fail('init of auth should fail')
        }
        catch(err){
            assert.strictEqual(err.message, 'server and client are required')
        }
    })

    it('no server', () => {
        try{
            const authTest = auth({client : {}});
            assert.fail('init of auth should fail')
        }
        catch(err){
            assert.strictEqual(err.message, 'server and client are required')
        }
    })

    it('missing server ', () => {
        try{
            const authTest = auth({server : {}, client : {}});
            assert.fail('init of auth should fail')
        }
        catch(err){
            assert.strictEqual(err.message, 'server.swapCodeURL and server.authURL and server.keepAliveURL are required')
        }
    })
});