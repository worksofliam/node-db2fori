const SignonConnection = require("./SignonConnection");
const SystemInfo = require("../data/SystemInfo");
const HostServerConnection = require("./HostServerConnection");
const Conv = require("./Conv");
const {DatabaseServerAttributes, ServerAttributeIDs} = require("../data/DatabaseServerAttributes");
const {DatabaseRequestAttributes, RequestAttributeIDs} = require('../data/DatabaseRequestAttributes');
const DataBuffer = require("./DataBuffer");
const SQLCommunicationsArea = require("../data/SQLCommunicationsArea");
const OperationalResultBitmap = require('../data/OperationalResultBitmap');

const MEANING = {
  JOB_NAME: 4383,
  MESSAGE_ID: 0x3801,
  FIRST_LEVEL_MESSAGE: 0x3802,
  SECOND_LEVEL_MESSAGE: 0x3803,
  SQLCA: 0x3807
};

const RPBRequestType = {
  CREATE: 0x1D00,
  RESET: 0x1D04
}

module.exports = class DatabaseConnection {
  /**
   * @param {HostServerConnection} databaseServer 
   * @param {SystemInfo} systemInfo 
   * @param {string} jobName 
   * @param {string} user 
   */
  constructor(databaseServer, systemInfo, jobName, user) {
    this.socket = databaseServer;
    this.systemInfo = systemInfo;
    this.jobName = jobName;
    this.user = user;

    /** @type {SQLCommunicationsArea} */
    this.currentSQLCA = undefined;

    this.compress = true;
    this.returnMessageInfo = false;

    this.correlationID = 1;
    this.currentRPB = -1;

    if (['localhost', '127.0.0.1'].includes(systemInfo.system)) {
      this.compress = false;
    }
  }

  close() {
    this.socket.close();
  }

  newCorrelationID() {
    if (this.correlationID == 0x7FFFFFFF) 
      this.correlationID = 0;
    return ++this.correlationID;
  }

  /**
   * @param {DatabaseServerAttributes} attributes 
   */
  async setServerAttributes(attributes) {
    const connection = this.socket;

    await connection.flush();
    await this.sendSetServerAttributesRequest(attributes);

    await connection.wait();

    const length = await this.readReplyHeader("setServerAttributes");
    var virtualRead = 40;

    if (length > 46) {
      var ll = connection.readInt();
      var cp = connection.readShort();

      if (cp !== 0x3804) {
        throw new Error(`setServerAttributes-reply ${cp}`);
      }

      if (ll < 122) {
        throw new Error(`setServerAttributes-reply ${ll}`);
      }

      const ccsid = connection.readShort();
      attributes.dateFormatParserOption = connection.readShort();
      attributes.dateSeparatorParserOption = connection.readShort();
      attributes.timeFormatParserOption = connection.readShort();
      attributes.timeSeparatorParserOption = connection.readShort();
      attributes.decimalSeparatorParserOption = connection.readShort();
      attributes.namingConventionParserOption = connection.readShort();
      attributes.ignoreDecimalDataErrorParserOption = connection.readShort();
      attributes.commitmentControlLevelParserOption = connection.readShort();
      attributes.drdaPackageSize = connection.readShort();
      attributes.translateIndicator = connection.readSingle();
      attributes.serverCCSID = connection.readShort();
      attributes.NLSSIndentifier = connection.readShort();
      var buf = Buffer.alloc(32);

      connection.readFullyExtra(buf, 0, 3);
      attributes.NLSSIdentifierLanguageID = Conv.EBCDICBufferToString(buf, 0, 3);

      connection.readFullyExtra(buf, 0, 10);
      attributes.NLSSIdentifierLanguageTableName = Conv.EBCDICBufferToString(buf, 0, 10);

      connection.readFullyExtra(buf, 0, 10);
      attributes.NLSSIdentifierLanguageTableLibrary = Conv.EBCDICBufferToString(buf, 0, 10);

      connection.readFullyExtra(buf, 0, 4);
      attributes.languageFeatureCode = Conv.EBCDICBufferToString(buf, 0, 4);

      connection.readFullyExtra(buf, 0, 10);
      attributes.serverFunctionalLevel = Conv.EBCDICBufferToString(buf, 0, 10);

      connection.readFullyExtra(buf, 0, 18);
      attributes.rdbName = Conv.EBCDICBufferToString(buf, 0, 18);

      connection.readFullyExtra(buf, 0, 10);
      attributes.defaultSQLLibraryName = Conv.EBCDICBufferToString(buf, 0, 10);

      connection.readFullyExtra(buf, 0, 26);
      attributes.serverJobName = Conv.EBCDICBufferToString(buf, 0, 10);
      attributes.serverJobUser = Conv.EBCDICBufferToString(buf, 10, 10);
      attributes.serverJobNumber = Conv.EBCDICBufferToString(buf, 20, 6);

      connection.skipBytes(ll-122);
      virtualRead += ll;
    }

    connection.skipBytes(length-virtualRead);
  }

  /**
   * @param {DatabaseServerAttributes} attributes 
   */
  async sendSetServerAttributesRequest(attributes) {
    const connection = this.socket;
    var length = 40, parms = 0;

    //
    var dataBuffer = new DataBuffer();

    for(const key in attributes) {
      if (attributes[key]) {
        switch (key) {
          case 'defaultClientCCSID':
          case 'drdaPackageSize':
          case 'dateFormatParserOption':
          case 'dateSeparatorParserOption':
          case 'timeFormatParserOption':
          case 'timeSeparatorParserOption':
          case 'decimalSeparatorParserOption':
          case 'namingConventionParserOption':
          case 'ignoreDecimalDataErrorParserOption':
          case 'commitmentControlLevelParserOption':
          case 'asciiCCSIDForTranslationTable':
          case 'ambiguousSelectOption':
          case 'packageAddStatementAllowed':
          case 'dataCompressionParameter':
          case 'locatorPersistence':
          case 'decimalFloatingPointRoundingModeOption':
          case 'decimalFloatingPointErrorReportingOption':
            length += 8;
            parms++;

            dataBuffer.writeInt(8);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeShort(attributes[key]);
            break;

          case 'languageFeatureCode':
            length += 12;
            parms++;

            dataBuffer.writeInt(12);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeShort(37);
            dataBuffer.writePadEBCDIC(attributes[key], 10);
            break;

          case 'clientFunctionalLevel':
            length += 18;
            parms++;

            dataBuffer.writeInt(18);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeShort(37);
            dataBuffer.writePadEBCDIC(attributes[key], 10);
            break;

          case 'NLSSIndentifier':
            var val = attributes.NLSSIndentifier;
            var ll = 8;

            parms++;
            length += 8;

            switch (val) {
              case 1:
              case 2:
                length += 5;
                ll += 5;
                break;
              
              case 3:
                length += 6;
                length += attributes.NLSSIdentifierLanguageTableName.length;
                length += attributes.NLSSIdentifierLanguageTableLibrary.length;

                ll += 6;
                ll += attributes.NLSSIdentifierLanguageTableName.length;
                ll += attributes.NLSSIdentifierLanguageTableLibrary.length;
                break;
            }
            
            dataBuffer.writeInt(ll);
            dataBuffer.writeShort(attributes[key]);
            dataBuffer.writeShort(val);

            if (val == 1 || val == 2)
            {
              dataBuffer.writeShort(37);
              dataBuffer.writePadEBCDIC(attributes.NLSSIdentifierLanguageID, 3);
            }
            else if (val == 3)
            {
              dataBuffer.writeShort(37);

              dataBuffer.writeShort(attributes.NLSSIdentifierLanguageTableName.length);
              dataBuffer.writePadEBCDIC(attributes.NLSSIdentifierLanguageTableName, attributes.NLSSIdentifierLanguageTableName.length);

              dataBuffer.writeShort(attributes.NLSSIdentifierLanguageTableLibrary.length);
              dataBuffer.writePadEBCDIC(attributes.NLSSIdentifierLanguageTableLibrary, attributes.NLSSIdentifierLanguageTableLibrary.length);
            }

            break;
          
          case 'translateIndicator':
          case 'useExtendedFormats':
          case 'trueAutoCommitIndicator':
          case 'hexadecimalConstantParserOption':
          case 'inputLocatorType':
          case 'optimizationGoalIndicator':
          case 'closeOnEOF':
            parms++;
            length += 7;

            dataBuffer.writeInt(7);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeByte(attributes[key]);
            break;

          
          case 'lobFieldThreshold':
          case 'clientSupportInformation':
          case 'queryStorageLimit':
            parms++;
            length += 10;

            dataBuffer.writeInt(10);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeInt(attributes[key]);
            break;

          case 'rdbName':
            parms++;
            length += 8 + attributes.rdbName;

            dataBuffer.writeInt(8 + attributes.rdbName.length);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeShort(37);
            writePadEBCDIC(attributes[key], attributes[key].length, out);
            break;

          case 'maximumDecimalPrecision': //One key to check all below properties
            if (attributes.maximumDecimalPrecision && attributes.maximumDecimalScale && attributes.minimumDivideScale) {
              parms++;
              length += 12;

              dataBuffer.writeInt(12);
              dataBuffer.writeShort(ServerAttributeIDs.maximumDecimalPrecision);
              dataBuffer.writeShort(attributes.maximumDecimalPrecision);
              dataBuffer.writeShort(attributes.maximumDecimalScale);
              dataBuffer.writeShort(attributes.minimumDivideScale);
            }
            break;
          
          case 'ewlmCorrelator':
            parms++;
            length += 6 + attributes.ewlmCorrelator.length;
            
            dataBuffer.writeInt(6 + attributes[key].length);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeBuffer(attributes[key]);
            break;
          
          case 'defaultSQLLibraryName':
          case 'rleCompression':
          case 'clientAccountingInformation':
          case 'clientApplicationName':
          case 'clientUserIdentifier':
          case 'clientWorkstationName':
          case 'clientProgramIdentifier':
          case 'interfaceType':
          case 'interfaceName':
          case 'interfaceLevel':
            parms++;
            length += 10 + attributes[key].length;

            dataBuffer.writeInt(10 + attributes[key].length);
            dataBuffer.writeShort(ServerAttributeIDs[key]);
            dataBuffer.writeShort(37); //CCSID?
            dataBuffer.writeShort(attributes[key].length);
            dataBuffer.writePadEBCDIC(attributes[key], attributes[key].length);
            break;
        }
      }
    }

    await this.writeHeader(length, 8064);

    // Write template.
    //await connection.writeInt(0x81000000); // Operational result (ORS) bitmap - return data + server attributes (no RLE compression).
    await connection.writeInt(-2130706432);
    await connection.writeInt(0); // Reserved.
    await connection.writeShort(0); // Return ORS handle - after operation completes.
    await connection.writeShort(0); // Fill ORS handle.
    await connection.writeShort(0); // Based on ORS handle.
    await connection.writeShort(0); // Request parameter block (RPB) handle.
    await connection.writeShort(0); // Parameter marker descriptor handle.
    await connection.writeShort(parms); // Parameter count.

    await connection.writeBuffer(dataBuffer.internalBuffer);
  }

  /**
   * 
   * @param {string} dataStream
   * @returns {number} length
   */
  async readReplyHeader(dataStream) {
    const connection = this.socket;
    const length = connection.readInt();

    if (length < 40) {
      throw new Error(`DataStream bad length: ${dataStream}, ${length}`);
    }

    const headerID = connection.readShort();
    const serverID = connection.readShort();
    const csInstance = connection.readInt();
    const correlationID = connection.readInt();
    const templateLength = connection.readShort();
    const reqRepID = connection.readShort();

    if (reqRepID !== 0x2800) {
      throw new Error(`DataStream bad reply: ${dataStream}, ${reqRepID}`);
    }

    const orsBitman = connection.readInt();
    const compressed = connection.readInt(); //First byte counts, last 3 reserved.
    const returnORSHandle = connection.readShort();
    const returnDataFunctionID = connection.readShort();
    const requestDataFunctionID = connection.readShort();
    const rcClass = connection.readShort();
    const rcClassReturnCode = connection.readInt();

    var numRead = 40;

    if (rcClass !== 0) {
      if (rcClassReturnCode >= 0) {
        // if (warningCallback_ != null)
        // {
        //   warningCallback_.newWarning(rcClass, rcClassReturnCode);
        // }
      } else {
        var messageID = null;
        var messageText = null;
        var messageText2 = null;
        
        var ccsid;
        var len;

        while (numRead < length) {
          var ll = connection.readInt();
          var cp = connection.readShort();

          switch (cp) {
            case MEANING.MESSAGE_ID:
              ccsid = connection.readShort();
              messageID = Buffer.alloc(ll-8);
              connection.readFully(messageID);
              messageID = Conv.EBCDICBufferToString(messageID, 0, messageID.length);
              break;

            case MEANING.FIRST_LEVEL_MESSAGE:
              ccsid = connection.readShort();
              len = connection.readShort();
              messageText = Buffer.alloc(ll-10);
              connection.readFully(messageText);
              messageText = Conv.EBCDICBufferToString(messageText, 0, messageText.length);
              break;

            case MEANING.SECOND_LEVEL_MESSAGE:
              ccsid = connection.readShort();
              len = connection.readShort();
              messageText2 = Buffer.alloc(ll-10);
              connection.readFully(messageText2);
              messageText2 = Conv.EBCDICBufferToString(messageText2, 0, messageText2.length);
              break;

            case MEANING.SQLCA:
              const sqlcaBuffer = Buffer.alloc(1024);
              connection.readFullyExtra(sqlcaBuffer, 0, ll-6);
              this.currentSQLCA = DatabaseConnection.parseSQLCA(sqlcaBuffer);

              break;

            default:
              connection.skipBytes(ll-6);
              break;
          }
          numRead += ll;
        }
        connection.skipBytes(length-numRead);

        if (messageID !== null) {
          const text = `${messageText ? messageText : ''} ${messageText2 ? messageText2 : ''}`;
          throw new Error(`${messageID}: ${text}`);
        } else {
          throw new Error(`DatabaseException: ${dataStream}, ${rcClass}, ${rcClassReturnCode}`);
        }
      }
    } else {
      // if (warningCallback_ != null)
      // {
      //   warningCallback_.noWarnings();
      // }
    }

    return length;
  }

  /**
   * 
   * @param {number} length 
   * @param {number} requestResponseType 
   */
  async writeHeader(length, requestResponseType) {
    const connection = this.socket;

    await connection.writeInt(length); // Length.
    //    await connection.writeShort(0); // Header ID.
    //    await connection.writeShort(0xE004); // Server ID.
    await connection.writeInt(0x0000E004); // Header ID and Server ID.
    await connection.writeInt(0); // CS instance.
    await connection.writeInt(this.newCorrelationID()); // Correlation ID.
    await connection.writeShort(20); // Template length.
    await connection.writeShort(requestResponseType); // ReqRep ID.
  }

    /**
   * @param {DatabaseRequestAttributes} attributes  In the Java code, this parameter is actually DatabaseCreateRequestParameterBlockAttributes, but our DatabaseRequestAttributes implements all of the attribute classes.
   * @param {number} rpbID
   */
  async createRequestParameterBlock(attributes, rpbID) {
    this.socket.flush();
    await this.sendSQLRPBRequest(attributes, true, rpbID, RPBRequestType.CREATE);
    
    await this.socket.wait();

    await this.readFullReply("createSQLRPB");
    this.currentRPB = rpbID;
  }

  /**
   * 
   * @param {DatabaseRequestAttributes} attributes 
   * @param {boolean} doReply 
   * @param {number} rpbID 
   * @param {number} rpbRequestType Please see RPBRequestType
   */
  async sendSQLRPBRequest(attributes, doReply, rpbID, rpbRequestType) {
    var length = 40;
    var parms = 0;

    var dataBuffer = new DataBuffer();

    if (attributes) {
      for(const key in attributes) {
        if (attributes[key]) {
          switch (key) {
            case 'packageLibrary':
            case 'packageName':
            case 'prepareStatementName':
            case 'sqlStatementText':
            case 'cursorName':
            case 'rleCompressedFunctionParameters':
              //char
              length += 10 + attributes[key].length;
              parms++;

              dataBuffer.writeInt(10 + attributes[key].length);
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeShort(37); //CCSID
              dataBuffer.writeShort(attributes[key].length);
              dataBuffer.writePadEBCDIC(attributes[key], attributes[key].length);
              break;

            case 'extendedSQLStatementText':
              length += 12 + (attributes[key].length*2);
              parms ++;
              //custom char, is unicode
              dataBuffer.writeInt(12 + (attributes[key].length*2));
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeShort(13488); //CCSID
              dataBuffer.writeInt(attributes[key].length*2);
              dataBuffer.writeUnicodeString(attributes[key]);
              break;
            
            case 'translateIndicator':
            case 'prepareOption':
            case 'openAttributes':
            case 'describeOption':
            case 'holdIndicator':
            case 'variableFieldCompression':
            case 'reuseIndicator':
            case 'extendedColumnDescriptorOption':
            case 'resultSetHoldabilityOption':
            case 'returnOptimisticLockingColumns':
              length += 7;
              parms ++;

              dataBuffer.writeInt(7);
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeByte(attributes[key]);
              break;

            case 'scrollableCursorFlag':
            case 'sqlStatementType':
            case 'sqlParameterMarkerBlockIndicator':
              length += 8;
              parms ++;

              dataBuffer.writeInt(8);
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeShort(attributes[key]);
              break;

            case 'blockingFactor':
            case 'queryTimeoutLimit':
            case 'serverSideStaticCursorResultSetSize':
            case 'fetchBufferSize':
              length += 10;
              parms ++;

              dataBuffer.writeInt(10);
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeInt(attributes[key]);
              break;

            case 'fetchScrollOption':
              length += (relative ? 12 : 8);
              parms ++;

              var relative = (attributes[key] === 0x0007 || attributes[key] === 0x0008);

              dataBuffer.writeInt(relative ? 12 : 8);
              dataBuffer.writeShort(RequestAttributeIDs[key]);
              dataBuffer.writeShort(attributes[key]);
              if (relative) {
                dataBuffer.writeInt(attributes.fetchScrollOptionRelativeValue);
              }
              break;

          }
        }
      }

      await this.writeHeader(length, rpbRequestType);
      await this.writeTemplate(parms, (doReply ? OperationalResultBitmap.SEND_REPLY_IMMED : 0x00000000), 0, rpbID);

      await this.socket.writeBuffer(dataBuffer.internalBuffer);
    }
  }

  /**
   * 
   * @param {number} parameterCount 
   * @param {number} orsBitmap 
   * @param {number} pmHandle 
   * @param {number} rpbHandle 
   */
  async writeTemplate(parameterCount, orsBitmap, pmHandle, rpbHandle) {
    var bitmap = orsBitmap | OperationalResultBitmap.SQLCA;
    if (this.compress) bitmap = bitmap | OperationalResultBitmap.REPLY_RLE_COMPRESSED;
    if (this.returnMessageInfo) 
      bitmap = bitmap | OperationalResultBitmap.MESSAGE_ID 
                      | OperationalResultBitmap.FIRST_LEVEL_TEXT
                      | OperationalResultBitmap.SECOND_LEVEL_TEXT;

    await this.socket.writeInt(bitmap); // Operational result (ORS) bitmap.
    await this.socket.writeInt(0); // Reserved.
    //await this.socket.writeShort(1); // Return ORS handle - after operation completes.
    //await this.socket.writeShort(1); // Fill ORS handle.
    await this.socket.writeInt(0x00010001); // Return ORS handle, Fill ORS handle.
    await this.socket.writeShort(0); // Based on ORS handle.
    await this.socket.writeShort(rpbHandle); // Request parameter block (RPB) handle.
    //await this.socket.writeInt(0x00000001); // Based on ORS handle, Request parameter block (RPB) handle.
    await this.socket.writeShort(pmHandle); // Parameter marker descriptor handle.
    await this.socket.writeShort(parameterCount); // Parameter count.
  }

  /**
   * @param {string} name datastream name
   */
  async readFullReply(name) {
    const length = await this.readReplyHeader(name);
    this.socket.skipBytes(length-40);
  }

  /**
   * @param {Buffer} buffer SQLCA buffer.
   * @returns {SQLCommunicationsArea} SQLCA
   */
  static parseSQLCA(buffer) {
    const sqlCode = buffer.readInt32BE(12);
    const updateCount = buffer.readInt32BE(104);
    const sqlState = Conv.EBCDICBufferToString(buffer, 131, 5);
    const generatedKey = Conv.packedDecimalToString(buffer, 32, 30, 0);
    const resultSetsCount = buffer.readInt32BE(100);

    return new SQLCommunicationsArea(sqlCode, sqlState, generatedKey, updateCount, resultSetsCount);
  }

  /**
   * 
   * @param {boolean} isSSL 
   * @param {string} system 
   * @param {string} user 
   * @param {string} password 
   * @returns {DatabaseConnection}
   */
  static async getConnection(isSSL, system, user, password) {
    //First we need to connect to the signon server to fetch information about the system.
    const signonConnection = await SignonConnection.getConnection(isSSL, system, user, password);
    const systemInfo = signonConnection.systemInfo;

    //We don't need to keep this connection. Bye bye!
    signonConnection.close();

    const databaseConnection = await DatabaseConnection.createConnection(isSSL, systemInfo, user, password);
    return databaseConnection;
  }

  /**
   * 
   * @param {boolean} isSSL 
   * @param {SystemInfo} systemInfo 
   * @param {string} user 
   * @param {string} password 
   * @returns {DatabaseConnection}
   */
  static async createConnection(isSSL, systemInfo, user, password) {
    const DATABASE_PORT = (isSSL ? 9471 : 8471);
    var databaseConnection = null;

    const databaseServer = new HostServerConnection();
    await databaseServer.connectSocket(systemInfo.system, DATABASE_PORT);

    const jobName = await DatabaseConnection.initialConnect(databaseServer, systemInfo, -8188, user, password);

    databaseConnection = new DatabaseConnection(databaseServer, systemInfo, jobName, user);
    return databaseConnection;
  }

  /**
   * 
   * @param {HostServerConnection} connection 
   * @param {SystemInfo} systemInfo 
   * @param {number} serverID always -8188
   * @param {string} user 
   * @param {string} password 
   * @returns {string} Job name
   */
  static async initialConnect(connection, systemInfo, serverID, user, password) {
    connection.flush();
    var seed = await DatabaseConnection.sendExchangeRandomSeedsRequest(connection, serverID);

    var clientSeed = Buffer.alloc(8);
    clientSeed.writeBigInt64BE(seed);

    await connection.wait();

    var length, returnCode;

    length = connection.readInt();

    if (length < 20) {
      throw new Error(`Exchange random seeds bad length: ${length} ${serverID}`);
    }

    connection.skipBytes(16);

    returnCode = connection.readInt();
    if (returnCode !== 0) {
      throw new Error(`Exchange return code is bad: ${returnCode} ${serverID}`);
    }

    const serverSeed = Buffer.alloc(8);
    connection.readFully(serverSeed);

    const userBytes = HostServerConnection.getUserBytes(user, systemInfo.passwordLevel);
    const passwordBytes = HostServerConnection.getPasswordBytes(password, systemInfo.passwordLevel);
    password = null;

    const encryptedPassword = HostServerConnection.getEncryptedPassword(userBytes, passwordBytes, clientSeed, serverSeed, systemInfo.passwordLevel);

    //Not sure why we do this a second time??
    const userEBCDICBytes = (
      systemInfo.passwordLevel 
      < 2 
      ? userBytes 
      : HostServerConnection.getUserBytes(user, 0)
    );

    connection.flush();
    await DatabaseConnection.sendStartServerRequest(connection, userEBCDICBytes, encryptedPassword, serverID);

    await connection.wait();

    length = connection.readInt();
    if (length < 20) {
      throw new Error(`Start server bad length: ${length} ${serverID}`);
    }

    connection.skipBytes(16);
    returnCode = connection.readInt(16);
    if (returnCode !== 0) {
      const message = getReturnCodeMessage(returnCode);
      if (message) {
        throw new Error(message);
      }
    }

    var jobName = null;
    var remaining = length - 24;

    while (remaining > 10) {
      var ll = connection.readInt();
      var cp = connection.readShort();

      remaining -= 6;

      switch (cp) {
        case MEANING.JOB_NAME:
          connection.skipBytes(4);
          remaining -= 4;
          const jobLength = ll - 10;
          const jobBytes = Buffer.alloc(jobLength);
          connection.readFully(jobBytes);
          jobName = Conv.EBCDICBufferToString(jobBytes, 0, jobBytes.length);
          remaining -= (ll - 6);
          break;

        default:
          connection.skipBytes(ll - 6);
          remaining -= (ll - 6);
          break;
      }
    }

    connection.skipBytes(remaining);

    return jobName;
  }

  static getReturnCodeMessage(returnCode) {
    if ((returnCode & 0xFFFF0000) == 0x00010000)
     return "Error on request data";
    if ((returnCode & 0xFFFF0000) == 0x00040000)
      return "General security error, function not performed";
    if ((returnCode & 0xFFFF0000) == 0x00060000)
      return "Authentication Token error";
    switch (returnCode) {
      case 0x00020001:
        return "Userid error: User Id unknown";
      case 0x00020002:
        return "Userid error: User Id valid, but revoked";
      case 0x00020003:
        return "Userid error: User Id mismatch with authentication token";
      case 0x0003000B:
        return "Password error: Password or Passphrase incorrect";
      case 0x0003000C:
        return "Password error: User profile will be revoked on next invalid password or passphrase";
      case 0x0003000D:
        return "Password error: Password or Passphrase correct, but expired";
      case 0x0003000E:
        return "Password error: Pre-V2R2 encrypted password";
      case 0x00030010:
        return "Password error: Password is *NONE";
    }
    return null;
  }

  /**
   * 
   * @param {HostServerConnection} connection 
   * @param {Buffer} userBytes 
   * @param {Buffer} encryptedPassword 
   * @param {number} serverID 
   */
  static async sendStartServerRequest(connection, userBytes, encryptedPassword, serverID) {
		await connection.writeInt(44 + encryptedPassword.length);
		await connection.writeByte(2); // Client attributes, 2 means return job info.
		await connection.writeByte(0); // Server attribute.
		await connection.writeShort(serverID); // Server ID.
		await connection.writeInt(0); // CS instance.
		await connection.writeInt(0); // Correlation ID.
		await connection.writeShort(2); // Template length.
		await connection.writeShort(0x7002); // ReqRep ID.
		await connection.writeByte(encryptedPassword.length == 8 ? 1 : 3); // Password
																// encryption
																// type.
		await connection.writeByte(1); // Send reply.
		await connection.writeInt(6 + encryptedPassword.length); // Password LL.
		await connection.writeShort(0x1105); // Password CP. 0x1115 is other.
		await connection.writeBuffer(encryptedPassword);
		await connection.writeInt(16); // User ID LL.
		await connection.writeShort(0x1104); // User ID CP.
		await connection.writeBuffer(userBytes);
  }

  /**
   * 
   * @param {HostServerConnection} connection 
   * @param {number} serverID 
   */
  static async sendExchangeRandomSeedsRequest(connection, serverID) {
		await connection.writeInt(28); // Length.
		await connection.writeByte(1); // Client attributes, 1 means capable of SHA-1.
		await connection.writeByte(0); // Server attributes.
		await connection.writeShort(serverID); // Server ID.
		await connection.writeInt(0); // CS instance.
		await connection.writeInt(0); // Correlation ID.
		await connection.writeShort(8); // Template length.
    await connection.writeShort(0x7001); // ReqRep ID.
    
    const longClientSeed = process.hrtime.bigint();
    await connection.writeLong(longClientSeed);
    
		return longClientSeed;
  }


}