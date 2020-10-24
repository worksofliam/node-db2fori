
const Conv = require('./Conv');

module.exports = class DataBuffer {
  constructor() {
    this.internalBuffer = Buffer.alloc(0);
  }

  flush() {
    this.internalBuffer = Buffer.alloc(0);
  }

  writeByte(value) {
    const buffer = Buffer.alloc(1);
    buffer.writeIntBE(1, 0, 1);

    this.internalBuffer = Buffer.concat([this.internalBuffer, buffer], (this.internalBuffer.length + buffer.length));
  }

  writeShort(value) {
    const buffer = Buffer.alloc(2);
    buffer.writeInt16BE(value);

    this.internalBuffer = Buffer.concat([this.internalBuffer, buffer], (this.internalBuffer.length + buffer.length));
  }

  writeInt(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeInt32BE(value);

    this.internalBuffer = Buffer.concat([this.internalBuffer, buffer], (this.internalBuffer.length + buffer.length));
  }

  writeLong(value) {
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(value);
    this.internalBuffer = Buffer.concat([this.internalBuffer, buffer], (this.internalBuffer.length + buffer.length));
  }

  write(buffer) {
    this.internalBuffer = Buffer.concat([this.internalBuffer, buffer], (this.internalBuffer.length + buffer.length));
  }

  /**
   * 
   * @param {string} string 
   * @param {number} padLength 
   */
  writePadEBCDIC(string, padLength) {
    string = string.padEnd(padLength);
    string = Conv.StringToEBCDICBuffer(string);

    this.internalBuffer = Buffer.concat([this.internalBuffer, string], (this.internalBuffer.length + string.length));
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
}