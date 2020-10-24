const {DatabaseRequestAttributes} = require('../data/DatabaseRequestAttributes');
const Connection = require('./Connection');

module.exports = class Statement {
  /**
   * @param {Connection} connection 
   * @param {string} statementName 
   * @param {string} cursorName 
   * @param {number} rpbID 
   */
  constructor(connection, statementName, cursorName, rpbID) {
    this.connection = connection;
    this.statementName = statementName;
    this.cursorName = cursorName;
    this.rpbID = rpbID;

    /** @type {DatabaseRequestAttributes} */
    this.statementAttributes = undefined;
    /** @type {DatabaseRequestAttributes} */
    this.attributes = undefined;
  }

  /**
   * This needs to be called right after the Statement has been constructed.
   */
  async initialRequest() {
    if (this.rpbID !== 0) {
      var dbRequestAttributes = new DatabaseRequestAttributes();
      dbRequestAttributes.cursorName = this.cursorName;
      dbRequestAttributes.prepareStatementName = this.statementName;
      await this.connection.createRequestParameterBlock(dbRequestAttributes, this.rpbID);

      this.attributes = dbRequestAttributes;
      this.statementAttributes = dbRequestAttributes.copy();
    }
  }
}