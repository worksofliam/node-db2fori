
const Column = require('./Column');

module.exports = class ResultSetMetaData {
  /**
   * @param {number} serverCCSID 
   * @param {string} catalog 
   */
  constructor(serverCCSID, catalog) {
    /** @type {Column[]} */
    this.columns;

    this.offset = undefined;
    
    this.catalog = catalog;

    this.serverCCSID = serverCCSID;
  }

  /**
   * 
   * @param {number} numberOfColumns 
   * @param {number} dateFormat 
   * @param {number} timeFormat 
   * @param {number} dateSeperator 
   * @param {number} timeSeperator 
   */
  resultSetDescription(numberOfColumns, dateFormat, timeFormat, dateSeperator, timeSeperator) {
    let column;

    for (let i = 0; i < numberOfColumns; i++) {
      column = new Column(i, false);
      column.dateFormat = dateFormat;
      column.timeFormat = timeFormat;
      column.dateSeperator = dateSeperator;
      column.timeSeperator = timeSeperator;

      this.columns.push(column);
    }

    this.offset = 0;
  }

  /**
   * @param {number} columnIndex 
   * @param {number} type 
   * @param {number} length 
   * @param {number} scale 
   * @param {number} precision 
   * @param {number} ccsid 
   * @param {number} joinRefPosition 
   * @param {number} attributeBitmap 
   * @param {number} lobMaxSize 
   */
  columnDescription(columnIndex, type, length, scale, precision, ccsid, joinRefPosition, attributeBitmap, lobMaxSize) {
    this.columns[columnIndex].type = type;
    this.columns[columnIndex].length = length;
    this.columns[columnIndex].scale = scale;
    this.columns[columnIndex].precision = precision;
    this.columns[columnIndex].setCCSID(ccsid);
    //this.columns[columnIndex].joinRefPosition = joinRefPosition;
    this.columns[columnIndex].offset = this.offset;
    this.columns[columnIndex].lobMaxSize = lobMaxSize;

    this.offset += length;
  }

  /**
   * @param {number} columnIndex 
   * @param {string} name 
   */
  setColumnName(columnIndex, name) {
    this.columns[columnIndex].name = name;
  }

  /**
   * @param {number} columnIndex 
   * @param {string} name 
   */
  setUDTName(columnIndex, name) {
    this.columns[columnIndex].udtName = name;
  }

  /**
   * @param {number} columnIndex 
   * @param {string} name 
   */
  setBaseTableName(columnIndex, name) {
    this.columns[columnIndex].table = name;
  }

  /**
   * @param {number} columnIndex 
   * @param {string} label 
   */
  setColumnLabel(columnIndex, label) {
    this.columns[columnIndex].table = label;
  }

  /**
   * @param {number} columnIndex 
   * @param {string} name 
   */
  setBaseSchemaName(columnIndex, name) {
    this.columns[columnIndex].schema = name;
  }

  /**
   * @param {number} columnIndex 
   * @param {number} updatable 
   * @param {number} searchable 
   * @param {boolean} isIdentity 
   * @param {boolean} isAlwaysGenerated 
   * @param {boolean} isPartOfAnyIndex 
   * @param {boolean} isLoneUniqueIndex 
   * @param {boolean} isPartOfUniqueIndex 
   * @param {boolean} isExpression 
   * @param {boolean} isPrimaryKey 
   * @param {boolean} isNamed 
   * @param {boolean} isRowID 
   * @param {boolean} isRowChangeTimestamp 
   */
  columnAttributes(columnIndex, updatable, searchable, isIdentity, isAlwaysGenerated, isPartOfAnyIndex, isLoneUniqueIndex, isPartOfUniqueIndex, isExpression, isPrimaryKey, isNamed, isRowID, isRowChangeTimestamp) {
    if (this.columns) {
      this.columns[columnIndex].autoIncrement = isIdentity;
      this.columns[columnIndex].definitelyWritable = updatable;
      this.columns[columnIndex].readonly = !updatable;
      this.columns[columnIndex].searchable = searchable;
      this.columns[columnIndex].writable = updatable;
    }
  }

  /**
   * 
   * @param {number} index 
   * @returns {Column}
   */
  getColumn(index) {
    return this.columns[index];
  }

  /**
   * @param {string} name 
   * @returns {Column}
   */
  getColumnByName(name) {
    return this.columns.find(column => column.name === name);
  }

  /**
   * @param {string} name 
   * @returns {Column}
   */
  getColumnIndexByName(name) {
    return this.columns.findIndex(column => column.name === name);
  }
}