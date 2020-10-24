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
}

module.exports = {DatabaseRequestAttributes, RequestAttributeIDs};