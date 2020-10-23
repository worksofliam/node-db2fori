const DatabaseConnection = require("../api/DatabaseConnection");
const {DatabaseServerAttributes} = require("../api/DatabaseServerAttributes");

module.exports = class Connection {
  /**
   * 
   * @param {DatabaseConnection} connection 
   */
  constructor(connection) {
    this.connection = connection;
    this.serverJobIdentifier = '';
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
}