const DataBuffer = require("../api/DataBuffer");

const RequestAttributeIDs = {
  packageLibrary: 0x3801,
  packageName: 0x3804,
  prepareStatementName: 0x3806,
  sqlStatementText: 0x3807,
  sqlStatementType: 0x3812,
  prepareOption: 0x3808, 
  openAttributes: 0x3809,
  translateIndicator: 0x3805,
  rleCompressedFunctionParameters: 0x3832,
  extendedColumnDescriptorOption: 0x3829,
  extendedSQLStatementText: 0x3831,
  syncPointCount: 0x3816,
  cursorName: 0x380B,
  reuseIndicator: 0x3810,
  describeOption: 0x380A,
  blockingFactor: 0x380C,
  fetchScrollOption: 0x380E,
  fetchBufferSize: 0x3834,
  holdIndicator: 0x380F,
  queryTimeoutLimit: 0x3817,
  serverSideStaticCursorResultSetSize: 0x3827,
  resultSetHoldabilityOption: 0x3830,
  variableFieldCompression: 0x3833,
  returnOptimisticLockingColumns: 0x3835,
  scrollableCursorFlag: 0x380D,
  sqlParameterMarkerBlockIndicator: 0x3814,

}

class DatabaseRequestAttributes {
  /**
   * 
   * @param {DatabaseRequestAttributes|undefined} from If you want to make a clone from a previous instance.
   */
  constructor(from = {}) {
    /** @type {string} */
    this.cursorName = from.cursorName;

    /** @type {number} */
    this.reuseIndicator = from.reuseIndicator;

    /** @type {number} */
    this.translateIndicator = from.translateIndicator;

    /** @type {Buffer} */
    this.rleCompressedFunctionParameters = from.rleCompressedFunctionParameters;

    /** @type {BigInt} */
    this.blockingFactor = from.blockingFactor;

    /** @type {number} */
    this.fetchScrollOption = from.fetchScrollOption;

    /** @type {number} */
    this.fetchScrollOptionRelativeValue = from.fetchScrollOptionRelativeValue;

    /** @type {BigInt} */
    this.fetchBufferSize = from.fetchBufferSize;
  
    /** @type {string} */
    this.packageLibrary = from.packageLibrary;

    /** @type {string} */
    this.packageName = from.packageName;

    /** @type {string} */
    this.prepareStatementName = from.prepareStatementName;

    /** @type {string} */
    this.sqlStatementText = from.sqlStatementText;

    /** @type {number} */
    this.prepareOption = from.prepareOption;

    /** @type {number} */
    this.openAttributes = from.openAttributes;

    /** @type {number} */
    this.describeOption = from.describeOption;

    /** @type {number} */
    this.scrollableCursorFlag = from.scrollableCursorFlag;

    /** @type {number} */
    this.holdIndicator = from.holdIndicator;

    /** @type {number} */
    this.sqlStatementType = from.sqlStatementType;

    /** @type {number} */
    this.sqlParameterMarkerBlockIndicator = from.sqlParameterMarkerBlockIndicator;

    /** @type {number} */
    this.queryTimeoutLimit = from.queryTimeoutLimit;

    /** @type {number} */
    this.serverSideStaticCursorResultSetSize = from.serverSideStaticCursorResultSetSize;

    /** @type {number} */
    this.extendedColumnDescriptorOption = from.extendedColumnDescriptorOption;

    /** @type {number} */
    this.resultSetHoldabilityOption = from.resultSetHoldabilityOption;
    
    /** @type {string} */
    this.extendedSQLStatementText = from.extendedSQLStatementText;

    /** @type {number} */
    this.variableFieldCompression = from.variableFieldCompression;
    
    /** @type {number} */
    this.returnOptimisticLockingColumns = from.returnOptimisticLockingColumns;

    /** @type {number} */
    this.returnSize = from.returnSize;

    /** @type {Buffer} */
    this.sqlParameterMarkerData = from.sqlParameterMarkerData;

    /** @type {Buffer} */
    this.sqlExtendedParameterMarkerData = from.sqlExtendedParameterMarkerData;
  
    /** @type {Buffer} */
    this.sqlParameterMarkerDataFormat = from.sqlParameterMarkerDataFormat;

    /** @type {Buffer} */
    this.extendedSQLParameterMarkerDataFormat = from.extendedSQLParameterMarkerDataFormat;
  
    /** @type {number} */
    this.syncPointCount = from.syncPointCount;
    
    /** @type {number} */
    this.lobLocatorHandle = from.lobLocatorHandle;

    /** @type {number} */
    this.requestedSize = from.requestedSize;

    /** @type {number} */
    this.compressionIndicator = from.compressionIndicator;

    /** @type {number} */
    this.returnCurrentLengthIndicator = from.returnCurrentLengthIndicator;

    /** @type {number} */
    this.columnIndex = from.columnIndex;

  }

  copy(attributes) {
    return new DatabaseRequestAttributes(attributes);
  }

  /**
   * 
   * @param {DatabaseRequestAttributes} attributes 
   */
  static getDataBuffer(attributes) {
    var length = 0;
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
    }

    return {
      buffer: dataBuffer.internalBuffer,
      length,
      parms
    }
  }
}

module.exports = {DatabaseRequestAttributes, RequestAttributeIDs};