
const connection = require('./lib/driver/Connection');

(async () => {
  const conn = await connection.getConnection(false, "seiden.iinthecloud.com", "alan3", "oi0ialan");
})();
