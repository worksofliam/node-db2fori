const DatabaseConnection = require("../api/DatabaseConnection");
const {DatabaseServerAttributes} = require("../data/DatabaseServerAttributes");
const Statement = require('./Statement');

const CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

module.exports = class Connection {
  /**
   * 
   * @param {DatabaseConnection} connection 
   */
  constructor(connection) {
    this.connection = connection;
    this.serverJobIdentifier = '';

    this.statements = {
      counter: 1,
      free: []
    };
    this.requestParameterBlocks = new Array(32767).fill(false);

    this.cursors = {
      counter: 1,
      free: []
    };
  }

  /**
   * Closes the connection.
   */
  close() {
    this.connection.close();
  }

  /**
   * @param {boolean} isSSL 
   * @param {string} system 
   * @param {string} user 
   * @param {string} password 
   */
  static async getConnection(isSSL, system, user, password) {
    const connection = await DatabaseConnection.getConnection(isSSL, system, user, password)
    
    var attributes = new DatabaseServerAttributes();
    attributes.namingConventionParserOption = 0;
    attributes.useExtendedFormats = 0xF2;
    attributes.defaultClientCCSID = 13488;
    attributes.dateFormatParserOption = 5; //ISO
    attributes.lobFieldThreshold = (1024*1024); //Use a locator for any LOB data fields longer than 1 MB.
    attributes.clientSupportInformation = 0x40000000; //Client supports true autocommit
    attributes.interfaceType = 'NODE'; //TODO: test if we can change this?
    attributes.interfaceName = 'Node.js';
    attributes.interfaceLevel = '20201022'; //YYYYMMDD

    await connection.setServerAttributes(attributes);

    const dbConnection = new Connection(connection);
    dbConnection.serverJobIdentifier = attributes.serverJobName + attributes.serverJobUser + attributes.serverJobNumber;

    return dbConnection;
  }

  /**
   * @returns {string} Free statement name
   */
  getNextStatementName() {
    if (this.statements.free.length > 0) {
      return this.statements.free.pop()
    } else {
      if (this.statements.counter === 2147483647) //int max value
        this.statements.counter = 1;
      else
        this.statements.counter++;

      var statementName = 'STMT00000000'.split('');

      //TODO: why build a statement name like this?
      var counter = this.statements.counter;
      for (var i = 10; i >= 4; i--) {
        statementName[i] = CHARS[counter & 0x0F];
        counter = counter >> 4;
      }

      return statementName.join('');
    }
  }

  getNextCursorName() {
    if (this.cursors.free.length > 0) {
      return this.cursors.free.pop()
    } else {
      if (this.cursors.counter === 2147483647) //int max value
        this.cursors.counter = 1;
      else
        this.cursors.counter++;

      var cursorName = 'CRSR00000000'.split('');

      //TODO: why build a statement name like this?
      var counter = this.cursors.counter;
      for (var i = 10; i >= 4; i--) {
        cursorName[i] = CHARS[counter & 0x0F];
        counter = counter >> 4;
      }

      return cursorName.join('');
    }
  }

  /**
   * @returns {number} a free request parameter block
   */
  getNextRPBID() {
    //0 is the default RPB on the server.
    const id = this.requestParameterBlocks.findIndex(x => x === false);

    if (id === -1)
      return id;
    else
      return id + 1;
  }

  async createStatement() {
    const statementName = this.getNextStatementName();
    const rpbID = this.getNextRPBID();
    const cursorName = this.getNextCursorName();

    const stmt = new Statement(this, statementName, cursorName, rpbID);
    await stmt.initialRequest();

    return stmt;
  }

  /**
   * @param {DatabaseRequestAttributes} attributes  In the Java code, this parameter is actually DatabaseCreateRequestParameterBlockAttributes, but our DatabaseRequestAttributes implements all of the attribute classes.
   * @param {number} rpbID
   */
  async createRequestParameterBlock(attributes, rpbID) { 
    await this.connection.createRequestParameterBlock(attributes, rpbID)
  }
}