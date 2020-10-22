const { throws } = require("assert");

module.exports = class SQLCommunicationsArea {
  /**
   * 
   * @param {number} sqlCode 
   * @param {string} sqlState 
   * @param {string} generatedKey 
   * @param {number} updateCount 
   * @param {number} resultSetsCount 
   */
  constructor(sqlCode, sqlState, generatedKey, updateCount, resultSetsCount) {
    this.SQLCODE = sqlCode;
    this.SQLSTATE = sqlState;
    this.generatedKey = (this.SQLCODE === 0 ? generatedKey : null);
    this.updateCount = updateCount;
    this.resultSetsCount = resultSetsCount;
  }
}