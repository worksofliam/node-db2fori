
const AttributesID = {
  defaultClientCCSID: 0x3801,
  languageFeatureCode: 0x3802,
  clientFunctionalLevel: 0x3803,
  NLSSIndentifier: 0x3804,
  translateIndicator: 0x3805,
  drdaPackageSize: 0x3806,
  dateFormatParserOption: 0x3807,
  dateSeparatorParserOption: 0x3808,
  timeFormatParserOption: 0x3809,
  timeSeparatorParserOption: 0x380A,
  decimalSeparatorParserOption: 0x380B,
  namingConventionParserOption: 0x380C,
  ignoreDecimalDataErrorParserOption: 0x380D,
  commitmentControlLevelParserOption: 0x380E,
  defaultSQLLibraryName: 0x380F,
  asciiCCSIDForTranslationTable: 0x3810,
  ambiguousSelectOption: 0x3811,
  packageAddStatementAllowed: 0x3812,
  useExtendedFormats: 0x3821,
  lobFieldThreshold: 0x3822,
  dataCompressionParameter: 0x3823,
  trueAutoCommitIndicator: 0x3824,
  clientSupportInformation: 0x3825,
  rdbName: 0x3826,
  maximumDecimalPrecision: 0x3827,
  hexadecimalConstantParserOption: 0x3828,
  inputLocatorType: 0x3829,
  locatorPersistence: 0x3830,
  ewlmCorrelator: 0x3831,
  rleCompression: 0x3832,
  optimizationGoalIndicator: 0x3833,
  queryStorageLimit: 0x3834,
  decimalFloatingPointRoundingModeOption: 0x3835,
  decimalFloatingPointErrorReportingOption: 0x3836,
  clientAccountingInformation: 0x3837,
  clientApplicationName: 0x3838,
  clientUserIdentifier: 0x3839,
  clientWorkstationName: 0x383A,
  clientProgramIdentifier: 0x383B,
  interfaceType: 0x383C,
  interfaceName: 0x383D,
  interfaceLevel: 0x383E,
  closeOnEOF: 0x383F
}

class DatabaseServerAttributes {
  constructor() {
    /** @type {number} */
    this.defaultClientCCSID = undefined;
    
    /** @type {string} */
    this.languageFeatureCode = undefined;

    /** @type {string} */
    this.clientFunctionalLevel = undefined;

    /** @type {number} */
    this.NLSSIndentifier = undefined;

    /** @type {string} */
    this.NLSSIdentifierLanguageID = undefined;

    /** @type {string} */
    this.NLSSIdentifierLanguageTableName = undefined;

    /** @type {string} */
    this.NLSSIdentifierLanguageTableLibrary = undefined;

    /** @type {number} */
    this.translateIndicator = undefined;

    /** @type {number} */
    this.drdaPackageSize = undefined;

    /** @type {number} */
    this.dateFormatParserOption = undefined;

    /** @type {number} */
    this.dateSeparatorParserOption = undefined;

    /** @type {number} */
    this.timeFormatParserOption = undefined;

    /** @type {number} */
    this.timeSeparatorParserOption = undefined;

    /** @type {number} */
    this.decimalSeparatorParserOption = undefined;

    /** @type {number} */
    this.namingConventionParserOption = undefined;

    /** @type {number} */
    this.ignoreDecimalDataErrorParserOption = undefined;

    /** @type {number} */
    this.commitmentControlLevelParserOption = undefined;

    /** @type {string} */
    this.defaultSQLLibraryName = undefined;

    /** @type {number} */
    this.asciiCCSIDForTranslationTable = undefined;

    /** @type {number} */
    this.ambiguousSelectOption = undefined;

    /** @type {number} */
    this.packageAddStatementAllowed = undefined;

    /** @type {number} */
    this.useExtendedFormats = undefined;

    /** @type {number} */
    this.lobFieldThreshold = undefined;

    /** @type {number} */
    this.dataCompressionParameter = undefined;

    /** @type {number} */
    this.trueAutoCommitIndicator = undefined;

    /** @type {number} */
    this.clientSupportInformation = undefined;

    /** @type {string} */
    this.rdbName = undefined;

    /** @type {number} */
    this.maximumDecimalPrecision = undefined;

    /** @type {number} */
    this.maximumDecimalScale = undefined;

    /** @type {number} */
    this.minimumDivideScale = undefined;

    /** @type {number} */
    this.hexadecimalConstantParserOption = undefined;

    /** @type {number} */
    this.inputLocatorType = undefined;

    /** @type {number} */
    this.locatorPersistence = undefined;

    /** @type {Buffer} */
    this.ewlmCorrelator = undefined;

    /** @type {Buffer} */
    this.rleCompression = undefined;

    /** @type {number} */
    this.optimizationGoalIndicator = undefined;

    /** @type {number} */
    this.queryStorageLimit = undefined;

    /** @type {number} */
    this.decimalFloatingPointRoundingModeOption = undefined;

    /** @type {number} */
    this.decimalFloatingPointErrorReportingOption = undefined;

    /** @type {string} */
    this.clientAccountingInformation = undefined;

    /** @type {string} */
    this.clientApplicationName = undefined;

    /** @type {string} */
    this.clientUserIdentifier = undefined;

    /** @type {string} */
    this.clientWorkstationName = undefined;

    /** @type {string} */
    this.clientProgramIdentifier = undefined;

    /** @type {string} */
    this.interfaceType = undefined;

    /** @type {string} */
    this.interfaceName = undefined;

    /** @type {string} */
    this.interfaceLevel = undefined;

    /** @type {number} */
    this.closeOnEOF = undefined;

    /** @type {number} */
    this.serverCCSID = undefined;

    /** @type {string} */
    this.serverFunctionalLevel = undefined;

    /** @type {string} */
    this.serverJobName = undefined;

    /** @type {string} */
    this.serverJobUser = undefined;

    /** @type {string} */
    this.serverJobNumber = undefined;
  }
}

module.exports = {DatabaseServerAttributes, AttributesID};