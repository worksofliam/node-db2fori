const net = require('net');
const Conv = require('./Conv');
const EncryptPassword = require('./EncryptPassword');

module.exports = class HostServerConnection extends net.Socket {
  constructor() {
    super({readable: true, writable: true});
    this.internalBuffer = new Buffer.alloc(0);
  }

  connectSocket(host, port) {
    return new Promise((resolve, reject) => {
      this.connect(port, host, (socket) => {
        resolve();
      });
    });
  }

  wait() {
    const currentSocket = this;
    return new Promise((resolve, reject) => {
      this.once('data', function (data) {
        currentSocket.internalBuffer = Buffer.concat([currentSocket.internalBuffer, data], (currentSocket.internalBuffer.length + data.length));
        resolve();
      });
    });
  }

  flush() {
    this.internalBuffer = Buffer.alloc(0);
  }

  readSingle() {
    const number = this.internalBuffer.readIntLE(0, 1);
    this.internalBuffer = this.internalBuffer.slice(1);

    return number;
  }

  readShort() {
    const number = this.internalBuffer.readInt16BE(0);
    this.internalBuffer = this.internalBuffer.slice(2);

    return number;
  }

  readInt() {
    const number = this.internalBuffer.readInt32BE(0);
    this.internalBuffer = this.internalBuffer.slice(4);

    return number;
  }

  readLong() {
    const number = this.internalBuffer.readBigInt64BE(0);
    this.internalBuffer = this.internalBuffer.slice(8);

    return number;
  }

  skipBytes(count) {
    this.internalBuffer = this.internalBuffer.slice(count);
  }

  readFully(inputBuffer) {
    this.internalBuffer.copy(inputBuffer, 0, 0, inputBuffer.length);
    this.internalBuffer = this.internalBuffer.slice(inputBuffer.length);
  }

  readFullyExtra(inputBuffer, offset, length) {
    this.internalBuffer.copy(inputBuffer, 0, offset, length);
    this.internalBuffer = this.internalBuffer.slice(length);
  }
  
  writeByte(value) {
    const buffer = new Buffer.alloc(1);
    buffer.writeIntBE(1, 0, 1);

    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  writeShort(value) {
    const buffer = new Buffer.alloc(2);
    buffer.writeInt16BE(value);

    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  writeInt(value) {
    const buffer = new Buffer.alloc(4);
    buffer.writeInt32BE(value);

    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  writeLong(value) {
    const buffer = new Buffer.alloc(8);
    buffer.writeBigInt64BE(value);

    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  writeBuffer(buffer) {
    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  /**
   * 
   * @param {string} string 
   * @param {number} padLength 
   */
  writePadEBCDIC(string, padLength) {
    string = string.padEnd(padLength);
    string = Conv.StringToEBCDICBuffer(string);

    return new Promise((resolve, reject) => {
      this.write(string, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  /**
   * @param {string} string 
   */
  writeUnicodeString(string) {
    const buffer = Buffer.from(string, 'utf16be');

    return new Promise((resolve, reject) => {
      this.write(buffer, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    })
  }

  close() {
    this.destroy();
  }

  /**
   * 
   * @param {string} user User name
   * @param {number} level Password level
   * @returns {Buffer}
   */
  static getUserBytes(user, level) {
    var outBuffer;

    user = user.toUpperCase();

    if (user.length <= 10) {
      user = user.padEnd(10);

      if (level < 2) {
        outBuffer = Conv.StringToEBCDICBuffer(user);

      } else {
        outBuffer = Buffer.from(user, 'utf16be');
      }

    } else {
      throw new Error(`User name too long: ${user}`);
    }

    return outBuffer;
  }

  /**
   * 
   * @param {string} password 
   * @param {number} level Password level
   */
  static getPasswordBytes(password, level) {
    var outBuffer;

    if (level < 2) {
      if (!isNaN(password)) {
        password = 'Q' + password;
      }

      if (password.length > 10) {
        throw new Error(`Password too long at password level ${level}.`);
      } else {
        password = password.toUpperCase().padEnd(10);
        outBuffer = Conv.StringToEBCDICBuffer(password);
      }

    } else {
      outBuffer = Buffer.from(password, 'utf16be');
    }

    return outBuffer;
  }

  /**
   * 
   * @param {Buffer} userBytes 
   * @param {Buffer} passwordBytes 
   * @param {Buffer} clientSeed 
   * @param {Buffer} serverSeed 
   * @param {Buffer} passwordLevel 
   */
  static getEncryptedPassword(userBytes, passwordBytes, clientSeed, serverSeed, passwordLevel) {
    const encryptor = new EncryptPassword(passwordLevel);
    const encryptedPassword = encryptor.encrypt(userBytes, passwordBytes, clientSeed, serverSeed);

    return encryptedPassword;
  }

}