const config = require('./config.json');
const auth = require('../lib/index')(config);
const assert = require('assert');

const debug = require('debug')('auth-client:test-validAPIKey');

describe('Test validApiKey', () => {
    before(()=>{
        debug('start')
    });

    after(()=>{
        debug('end')
    });

    it('validApiKey success', () => {
        const req = {
            get: (header)=>{
                const valid = {}
                valid['X-Api-Key'] = 'TEST_API_KEY';
                return valid[header];
            }
        }
        const result = auth.validApiKey(req,'TEST_API_KEY');
        assert.strictEqual(result,'legacy', 'result')
    })

    it('validApiKey failure - invalid key', () => {
        const req = {
            get: (header)=>{
                const valid = {}
                valid['X-Api-Key'] = 'WRONG_API_KEY';
                return valid[header];
            }
        }
        const result = auth.validApiKey(req,'TEST_API_KEY');
        assert.strictEqual(result, false, 'result')
    })

    it('validApiKey failure - no API Key', () => {
        const req = {
            get: (header)=>{
                const valid = {}
                valid['X-Api-Key'] = 'WRONG_API_KEY';
                return valid[header];
            }
        }
        const result = auth.validApiKey(req,undefined);
        assert.strictEqual(result, false, 'result')
    })

    it('validApiKey failure - no key', () => {
        const req = {
            get: (header)=>{
                return undefined;
            }
        }
        const result = auth.validApiKey(req,'TEST_API_KEY');
        assert.strictEqual(result, false, 'result')
    })


    it('validApiKey success - multiple keys', () => {
        const req = {
            get: (header)=>{
                const valid = {}
                valid['X-Api-Key'] = 'TEST_API_KEY';
                return valid[header];
            }
        }
        const result = auth.validApiKey(req,[{ thirdParty : 'TEST_THIRD_PARTY_2', key: 'TEST_API_KEY_2'}, { thirdParty : 'TEST_THIRD_PARTY', key: 'TEST_API_KEY'}]);
        assert.strictEqual(result,'TEST_THIRD_PARTY', 'result')
    })

    it('validApiKey failure - multiple keys', () => {
        const req = {
            get: (header)=>{
                const valid = {}
                valid['X-Api-Key'] = 'WRONG_API_KEY';
                return valid[header];
            }
        }
        const result = auth.validApiKey(req,[{ thirdParty : 'TEST_THIRD_PARTY_2', key: 'TEST_API_KEY_2'}, { thirdParty : 'TEST_THIRD_PARTY', key: 'TEST_API_KEY'}]);
        assert.strictEqual(result,false, 'result')
    })

});