
const { promisify } = require('util')
const { createPool } = require('mysql2')
const { createClient } = require("redis");

var redis_conn = createClient("redis://localhost:6379"), multi;
var mysql_conn = createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'm2np_admin',
    password: 'aassddff',
    database: 'm2np'
});

const rdGet = promisify(redis_conn.get).bind(redis_conn);
const rdIncr = promisify(redis_conn.incr).bind(redis_conn);
const dbAr = promisify(mysql_conn.query).bind(mysql_conn);
const dbRow = async (query, params) => {
    var data = await dbAr(query, params);
    return data.length > 0 ? data[0] : {}
}
const dbRs = async (query, params) => {
    var data = await dbRow(query, params)
    const keys = Object.keys(data)
    return keys.length > 0 ? data[keys[0]] : null
}
mysql_conn.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('MYSQL testing... The solution of 1+1 is: ', results[0].solution);
});

(async () => {
    const res = await rdIncr("TEST_ATOM");
    console.log('REDIS testing... The solution of incr atom is: ', res)
})()




redis_conn.on("error", function (err) {
    console.log("Error " + err);
});

export { rdGet, rdIncr, dbAr, dbRow, dbRs }