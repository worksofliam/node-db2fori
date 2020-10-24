const process = require('process');
const HostServerConnection = require('./HostServerConnection');
const SystemInfo = require('../data/SystemInfo');
const Conv = require('./Conv');

const MEANING = {
  SERVER_VERSION: 4353,
  SERVER_LEVEL: 4354,
  SERVER_SEED: 4355,
  PASSWORD_LEVEL: 4377,
  JOB_NAME: 4383,
  CCSID: 4372
}

const RETURNCODE = {
  UNKNOWN_USER: 0x20001,
  INCORRECT_PASSWORD: 0x3000B
};

module.exports = class SignonConnection {
  /**
   * 
   * @param {SystemInfo} systemInfo 
   * @param {HostServerConnection} signonConnection 
   * @param {string} user 
   */
  constructor(systemInfo, signonConnection, user) {
    this.systemInfo = systemInfo;
    this.socket = signonConnection;
    this.user = user;
    this.jobName = systemInfo.jobName;
  }

  /**
   * 
   * @param {string} user 
   * @param {string} password 
   */
  async authenticate(user, password) {
    const connection = this.socket;

    if (!connection.writable) {
      throw new Error("Not connected.");
    }

    const returnData = await SignonConnection.getInfo(true, this.systemInfo.system, connection);
    const {clientSeed, serverSeed} = returnData;

    const userBytes = HostServerConnection.getUserBytes(user, this.systemInfo.passwordLevel);
    const passwordBytes = HostServerConnection.getPasswordBytes(password, this.systemInfo.passwordLevel);
    password = null;

    const encryptedPassword = HostServerConnection.getEncryptedPassword(userBytes, passwordBytes, clientSeed, serverSeed, this.systemInfo.passwordLevel);

    //Not sure why we do this a second time??
    const userEBCDICBytes = (
      this.systemInfo.passwordLevel 
      < 2 
      ? userBytes 
      : HostServerConnection.getUserBytes(user, 0)
    );

    await connection.flush();
    await SignonConnection.sendSignonInfoRequest(connection, this.systemInfo, userEBCDICBytes, encryptedPassword);

    await connection.wait();

    const length = connection.readInt();

    if (length < 20) {
      throw new Error(`signonInfo bad length: ${length}`);
    }

    connection.skipBytes(16);

    const returnCode = connection.readInt();
    var numRead = 24;

    try {
      if (returnCode != 0) {
        var errorText;

        switch (returnCode) {
          case RETURNCODE.UNKNOWN_USER:
            errorText = `User ID is not known`;
            break;
          case RETURNCODE.INCORRECT_PASSWORD:
            errorText = `Password is incorrect`;
            break;
          default:
            errorText = `Unknown error: ${returnCode}`;
            break;
        }

        throw new Error(`Signon return code error: ${errorText}.`);
      } else {

        while (numRead < length && this.systemInfo.serverCCSID === undefined) {
          var ll = connection.readInt();
          var cp = connection.readShort();

          var currentRead = 0;

          switch (cp) {
            case MEANING.CCSID:
              this.systemInfo.serverCCSID = connection.readInt();
              currentRead += 4;
              break;
          }

          connection.skipBytes(ll-6-currentRead);
          numRead += ll;
        }

      }
    } catch (e) {
      throw e;
    }

    connection.skipBytes(length-numRead);
  }

  close() {
    this.socket.close();
  }

  /**
   * 
   * @param {boolean} isSSL 
   * @param {string} system 
   * @param {string} user 
   * @param {string} password 
   * @param {number} signonPort 8476 is the default.
   * @returns {SignonConnection}
   */
  static async getConnection(isSSL, system, user, password, signonPort = 8476) {
    const signonServer = new HostServerConnection();

    await signonServer.connectSocket(system, signonPort);
    const info = await SignonConnection.getInfo(false, system, signonServer);

    var conn = new SignonConnection(info.systemInfo, signonServer, user);
    await conn.authenticate(user, password);
    return conn;
  }

  /**
   * 
   * @param {boolean} doSeeds 
   * @param {string} system 
   * @param {object} connection 
   * @returns {{clientSeed, serverSeed, systemInfo}} Return data
   */
  static async getInfo(doSeeds, system, connection) {
    var returnData = {
      clientSeed: undefined, //Should be buffer
      serverSeed: undefined, //Should be buffer
      systemInfo: undefined //SystemInfo class
    }

    await connection.flush();
    const clientSeed = await this.sendSignonExchangeAttributeRequest(connection);

    await connection.wait();

    if (doSeeds)
    {
        returnData.clientSeed = Buffer.alloc(8);
        returnData.clientSeed.writeBigInt64BE(clientSeed);
    }

    var length = connection.readInt();

    if (length < 20) {
      throw new Error(`signonExchangeAttributes badlength ${length}`);
    }

    connection.skipBytes(16);
    var rc = connection.readInt();

    if (rc !== 0) {
      connection.skipBytes(length-24);
      throw new Error(`signonExchangeAttributes ${rc}`);
    }

    var curLength = 24;
    var serverVersion = -1;
    var foundServerVersion = false;
    var serverLevel = -1;
    var foundServerLevel = false;
    var foundServerSeed = false;
    var passwordLevel = -1;
    var foundPasswordLevel = false;
    var jobName = null;

    while (curLength < length && (!foundServerVersion || !foundServerLevel || !foundPasswordLevel || (!doSeeds || (doSeeds && !foundServerSeed)))) {
      var oldLength = curLength;

      var ll = connection.readInt();
      var cp = connection.readShort();
      curLength += 6;

      switch (cp) {
        case MEANING.SERVER_VERSION:
          serverVersion = connection.readInt();
          curLength += 4;
          foundServerVersion = true;
          break;

        case MEANING.SERVER_LEVEL:
          serverLevel = connection.readShort();
          curLength += 2;
          break;

        case MEANING.SERVER_SEED:
          if (doSeeds) {
            returnData.serverSeed = Buffer.alloc(ll-6);
            connection.readFully(returnData.serverSeed);
            foundServerSeed = true;
          } else {
            connection.skipBytes(ll-6);
          }
          curLength += ll-6;
          break;

        case MEANING.PASSWORD_LEVEL:
          passwordLevel = connection.readSingle();
          curLength += 1;
          foundPasswordLevel = true;
          break;

        case MEANING.JOB_NAME:
          connection.skipBytes(4); // CCSID is always 0.
          curLength += 4;
          var jobBytes = Buffer.alloc(ll-10);
          connection.readFully(jobBytes);
          //jobBytes here is actually ebcdic :(
          //TODO: implement EBCDIC to unicode
          jobName = Conv.EBCDICBufferToString(jobBytes, 0, jobBytes.length);
          curLength += ll-10;
          break;

        default:
          connection.skipBytes(ll-6);
          curLength += ll-6;
          break;
      }
      var diff = ll - (curLength - oldLength);
      if (diff > 0) connection.skipBytes(diff);
    }

    connection.skipBytes(length-curLength);

    returnData.systemInfo = new SystemInfo({
      system,
      serverVersion,
      serverLevel,
      passwordLevel,
      jobName
    })

    return returnData;
  }

  /**
   * 
   * @param {HostServerConnection} connection 
   * @returns {bigint} Client seed
   */
  static async sendSignonExchangeAttributeRequest(connection) {
    await connection.writeInt(52); // Length;
    await connection.writeShort(0); // Header ID (almost always zero for all datastreams).
    await connection.writeShort(-8183); // Server ID.
    await connection.writeInt(0); // CS instance.
    await connection.writeInt(0); // Correlation ID.
    await connection.writeShort(0); // Template length.
    await connection.writeShort(28675); // ReqRep ID.
    await connection.writeInt(10); // Client version LL.
    await connection.writeShort(4353); // Client version CP.
    await connection.writeInt(1); // Client version.
    await connection.writeInt(8); // Client datastream level LL.
    await connection.writeShort(4354); // Client datastream level CP.
    await connection.writeShort(2); // Client datastream level.
    await connection.writeInt(14); // Client seed LL.
    await connection.writeShort(4355); // Client seed CP.

    const longClientSeed = process.hrtime.bigint();
    await connection.writeLong(longClientSeed);

    return longClientSeed;
  }

  /**
   * @param {HostServerConnection} connection 
   * @param {SystemInfo} systemInfo 
   * @param {Buffer} userBytes 
   * @param {Buffer} encryptedPassword 
   */
  static async sendSignonInfoRequest(connection, systemInfo, userBytes, encryptedPassword) {
    var total = 37 + encryptedPassword.length + 16;
    const newerServer = systemInfo.serverLevel >= 5;
    if (newerServer) total += 7;

    await connection.writeInt(total); // Length.
    await connection.writeShort(0); // Header ID (almost always zero for all datastreams).
    await connection.writeShort(-8183); // Server ID.
    await connection.writeInt(0); // CS instance.
    await connection.writeInt(0); // Correlation ID.
    await connection.writeShort(1); // Template length.
    await connection.writeShort(28676); // ReqRep ID.
    await connection.writeByte(encryptedPassword.length == 8 ? 1 : 3); // Password encryption type.
    await connection.writeInt(10); // Client CCSID LL.
    await connection.writeShort(4371); // Client CCSID CP.
    await connection.writeInt(1200); // Client CCSID (big endian UTF-16).
    await connection.writeInt(6+encryptedPassword.length); // Password LL.
    await connection.writeShort(4357); // Password CP. 0x1115 is other.
    await connection.writeBuffer(encryptedPassword); // Password.
    await connection.writeInt(16); // User ID LL.
    await connection.writeShort(4356); // User ID CP.
    await connection.writeBuffer(userBytes); // User ID.

    if (newerServer)
    {
      await connection.writeInt(7); // Return error messages LL.
      await connection.writeShort(4392); // Return error messages CP.
      await connection.writeByte(1); // Return error messages.
    }
  }
}