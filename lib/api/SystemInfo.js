module.exports = class SystemInfo {
  constructor(data) {
    this.system = data.system;
    this.serverVersion = data.serverVersion;
    this.serverLevel = data.serverLevel;
    this.serverCCSID = data.serverCCSID;
    this.passwordLevel = data.passwordLevel;
    this.jobName = data.jobName;
  }
}