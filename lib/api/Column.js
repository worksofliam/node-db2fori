
const Types = require('./Types');

const TYPE_STRING = 1;
const TYPE_INT = 2;
const TYPE_LONG = 3;
const TYPE_SHORT = 4;
const TYPE_FLOAT = 5;
const TYPE_DOUBLE = 6;
const TYPE_BYTE = 7;
const TYPE_BOOLEAN = 8;
const TYPE_DATE = 9;
const TYPE_TIME = 10;
const TYPE_TIMESTAMP = 11;
const TYPE_BYTE_ARRAY = 12;
const TYPE_BIG_DECIMAL = 13;
const TYPE_OBJECT = 14;
const TYPE_URL = 15;
const TYPE_ASCII_STREAM = 16;
const TYPE_BINARY_STREAM = 17;
const TYPE_UNICODE_STREAM = 18;
const TYPE_CHARACTER_STREAM = 19;

module.exports = class Column {
  constructor(index, parameter) {
    /** @type {String} */
    this.name;
    /** @type {String} */
    this.udtName;

    /** @type {number} */
    this.type;
    /** @type {number} Length of data type in the buffer sent to / from host server */
    this.length;
    /** @type {number} This is the declared length of the type, calculated when needed */
    this.declaredLength = 0;
    /** @type {number} */
    this.scale;
    /** @type {number} */
    this.precision;
    /** @type {number} */
    this.ccsid;
    /** @type {boolean} */
    this.isForBitData;
    /** @type {number} */
    this.lobMaxSize;

    /** @type {number} */
    this.offset;

    /** @type {number} */
    this.index;
    /** @type {boolean} is this a parameter */
    this.parameter;

    /** @type {Buffer} */
    this.buffer;

    /** @type {number} */
    this.dateFormat;
    /** @type {number} */
    this.timeFormat;
    /** @type {number} */
    this.dateSeparator;
    /** @type {number} */
    this.timeSeparator;

    /** @type {String} */
    this.table;
    /** @type {String} */
    this.label;
    /** @type {String} */
    this.schema;
    /** @type {boolean} */
    this.autoIncrement;
    /** @type {boolean} */
    this.definitelyWritable;
    /** @type {boolean} */
    this.readonly = true;
    /** @type {boolean} */
    this.searchable = true;
    /** @type {boolean} */
    this.writable;

    /** @type {boolean} */
    this.useDateCache = false;
    /** @type {Buffer} */
    this.dateCache;
    // Date dateZero;

    /** @type {boolean} */
    this.useTimeCache = false;
    /** @type {Buffer} */
    this.timeCache;

    /** @type {boolean} */
    this.useStringCache = false;
    /** @type {boolean} */
    this.cacheLastOnly = false;
    /** @type {Buffer} */
    this.cache = null;


    /** @type {boolean} */
    this.null = false;
    /** @type {any} */
    this.value = null;
    /** @type {number} */
    this.valueType = 0;
  }

  clearValue() {
    this.null = false;
    this.value = null;
    this.valueType = 0;
  }

  /**
   * @param {any} value 
   * @param {number} [type]
   */
  setValue(value, type) {
    this.value = value;

    if (type) {
      this.valueType = type;
    } else {
      switch (typeof value) {
        case "string": this.valueType = TYPE_STRING; break;
        case "number": this.valueType = TYPE_DOUBLE; break;
        case "boolean": this.valueType = TYPE_BOOLEAN; break;
      }
    }
  }

  /**
   * @returns {string}
   */
  getValueString() {
    return String(this.value);
  }

  /**
   * @returns {number}
   */
  getDeclaredLength() {
    if (this.declaredLength === 0) {
      switch (this.type & 0xFFFE) {
        case Types.VARBINARY:
        case Types.VARCHAR:
        case Types.DATALINK:
        case Types.LONGVARCHAR:
        case Types.ROWID:
          this.declaredLength = this.length - 2;
          break;

        case Types.VARGRAPHIC:
        case Types.LONGVARGRAPHIC:
          this.declaredLength = (this.length - 2)/2;
          break;

        case Types.BLOB:
        case Types.CLOB:
          this.declaredLength = this.length - 4;
          break;

        case Types.DBCLOB:
          this.declaredLength = (this.length - 4)/2;
          break;

        case Types.GRAPHIC:
          this.declaredLength = this.length / 2;
          break;

        case Types.DECIMAL:
        case Types.NUMERIC:
          this.declaredLength = precision_;
          break;

        case Types.BLOB_LOCATOR:
        case Types.CLOB_LOCATOR:
        case Types.DBCLOB_LOCATOR:
        case Types.XML_LOCATOR:
          this.declaredLength = lobMaxSize_;
          break;

        case Types.DECFLOAT:
        if (this.length == 8) {
          this.declaredLength = 16;
        } else if (this.length == 16) {
          this.declaredLength = 34;
        } else {
          throw JDBCError.getSQLException(JDBCError.EXC_INTERNAL,
              "Unknown DECFLOAT length= " + this.length);
        }
        break;

        case Types.TIMESTAMP:
          this.declaredLength = 26;
          break;

        case Types.TIME:
          this.declaredLength = 8;
          break;

        case Types.DATE:
          this.declaredLength = 10;
          break;

        default:
          this.declaredLength = this.length;
      }
    }

    return this.declaredLength;
  }

  /**
   * @param {number} ccsid 
   */
  setCCSID(ccsid) {
    // If the ccsid is 65535 switch the type if chartype

    this.ccsid = ccsid;
    if (ccsid_ == 65535) {
      switch (this.type) {
        case Types.CHAR: this.type = Types.BINARY; this.isForBitData = true; break;
        case Types.CHAR+1: this.type = Types.BINARY+1; this.isForBitData = true;  break;
        case Types.VARCHAR: this.type = Types.VARBINARY; this.isForBitData = true;  break;
        case Types.VARCHAR+1: this.type = Types.VARBINARY+1; this.isForBitData = true;  break;
        case Types.LONGVARCHAR: this.type = Types.VARBINARY; this.isForBitData = true;  break;
        case Types.LONGVARCHAR+1: this.type = Types.VARBINARY+1; this.isForBitData = true;  break;
      }
    }
  }
}