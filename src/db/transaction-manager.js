const pool = require('./pool');

const withTransaction = async (operation) => {
  const client = await pool.connect();
  let transactionStarted = false;
  let releaseError;

  try {
    await client.query('BEGIN');
    transactionStarted = true;
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        releaseError = rollbackError;
      }
    }
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release(releaseError);
  }
};

module.exports = { withTransaction };
