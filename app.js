'use strict'

global.fastify = require('fastify')({ logger: { level: 'warn' } })
const fastify = global.fastify
import oauthPlugin, { FACEBOOK_CONFIGURATION } from 'fastify-oauth2';

fastify.register(require('fastify-cookie'))
fastify.register(oauthPlugin, {
    name: 'facebookOAuth2',
    credentials: {
        client: {
            id: '428914971313975',
            secret: '1aebca17a40032296374b98fc220cdd5'
        },
        auth: FACEBOOK_CONFIGURATION
    },
    startRedirectPath: '/login/facebook',
    callbackUri: 'http://localhost:3000/login/facebook/callback'
})


require("./routes")

fastify.listen(3000)