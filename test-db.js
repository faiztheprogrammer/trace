const pool = require('./db.js');

async function testDatabase() {
    try {
        const bugs = await pool.query('SELECT *FROM bugs');
        console.log(bugs.rows);
    } catch (error) {
        console.log(error.message)
    } finally {
        await pool.end();
    }
}

testDatabase();