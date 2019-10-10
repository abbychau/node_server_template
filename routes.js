const fastify = global.fastify
import { concat } from 'simple-get';
import uuidv4 from 'uuid/v4';

import { rdIncr, dbAr, dbRow, dbRs, rdGet } from './connections';


fastify.addHook('preValidation', (request, reply, done) => {
    request.meta = {}

    request.meta.isLogin = (request.cookies && request.cookies.auth_token)
    if (request.meta.isLogin) {
        var data = await dbRow('SELECT * FROM tokens WHERE token = ?', [request.cookies.auth_token]);
    }
    reply.send(data[0])

    done()
})

fastify.get('/home', async function (request, reply) {
    reply.header('content-type', 'text/html')
    if (!request.meta.isLogin) {
        return "not logged in. <a href='/login/facebook'>login</a>"
    }

    const res = await rdIncr("TEST_ATOM");
    var message = 'testing';
    if (request.cookies) {
        const myToken = request.cookies.auth_token
        if (myToken) {
            message = "<a href='/logout'>log out</a>" + myToken + ' '
        }
    }
    return (message + res)
})

fastify.get('/logout', async (req, reply) => {
    reply.clearCookie('auth_token', { path: '/' })
    return { message: 'success' }
})

fastify.get('/login/facebook/callback', function (request, reply) {
    this.getAccessTokenFromAuthorizationCodeFlow(request, (err, result) => {
        if (err) {
            console.log("error1");
            reply.send(err)
            return
        }

        // auth correct
        concat(
            {
                url: 'https://graph.facebook.com/v3.0/me',
                method: 'GET',
                headers: {
                    Authorization: 'Bearer ' + result.access_token
                },
                json: true
            },
            function (err, res, data) {
                if (err) {
                    console.log("error2");
                    reply.send(err)
                    return
                }
                console.log("success");

                const token = uuidv4();
                // insert token to session table
                reply.setCookie('auth_token', token, {
                    path: '/',
                    expires: 365 * 24 * 60 * 60 * 1000 + Date.now()
                }).redirect('/home')
            }
        )
    })
})

fastify.get('/api/user/:id', async (request, reply) => {
    var data = await dbAr('SELECT id,username,display_name,description FROM users WHERE id = ? LIMIT 100 ', [Number(request.params.id)]);
    reply.send(data[0])
})
fastify.get('/api/users/subscribed', async (request, reply) => {
    var data = await dbAr('SELECT id,username,display_name,description FROM users WHERE id = ? LIMIT 100 ', [1]);

    reply.send(
        data
    )
})

fastify.post('/api/post', async (request, reply) => {
    console.log(request)
})

fastify.get('/api/article/:id', async (request, reply) => {
    var data = await dbAr('SELECT * FROM records WHERE id = ?', []);

    reply.send(
        data
    )
})
