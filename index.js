
const connection = require('./lib/driver/Connection');

(async () => {
  const conn = await connection.getConnection(false, "", "", "");
})();
