module.exports = class Statement {
    constructor(connection, statementName, cursorName, rpbID) {
        this.connection = connection;
        this.statementName = statementName;
        this.cursorName = cursorName;
        this.rpbID = rpbID;

        if (rpbID !== 0) {
            
        }
    }
}