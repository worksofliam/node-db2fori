
const connection = require('./lib/driver/Connection');

(async () => {
  const conn = await connection.getConnection(false, process.env.SYSTEM, process.env.USER, process.env.PASS);
})();
