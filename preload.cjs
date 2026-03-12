const SESSION_ID = process.env.SESSION_ID;
const OWNER_NUMBER = process.env.OWNER_NUMBER;

if (SESSION_ID || OWNER_NUMBER) {
  const fs = require('fs');

  const patchEnvContent = (content) => {
    if (typeof content !== 'string') return content;
    if (SESSION_ID) {
      if (/SESSION_ID=/.test(content)) {
        content = content.replace(/SESSION_ID="[^"]*"/, `SESSION_ID="${SESSION_ID}"`);
        content = content.replace(/SESSION_ID='[^']*'/, `SESSION_ID="${SESSION_ID}"`);
        content = content.replace(/SESSION_ID=[^\n\r]*/, `SESSION_ID="${SESSION_ID}"`);
      } else {
        content = `SESSION_ID="${SESSION_ID}"\n` + content;
      }
    }
    if (OWNER_NUMBER) {
      if (/OWNER_NUMBER=/.test(content)) {
        content = content.replace(/OWNER_NUMBER="[^"]*"/, `OWNER_NUMBER="${OWNER_NUMBER}"`);
        content = content.replace(/OWNER_NUMBER='[^']*'/, `OWNER_NUMBER="${OWNER_NUMBER}"`);
        content = content.replace(/OWNER_NUMBER=[^\n\r]*/, `OWNER_NUMBER="${OWNER_NUMBER}"`);
      } else {
        content = `OWNER_NUMBER="${OWNER_NUMBER}"\n` + content;
      }
    }
    return content;
  };

  const isEnvFile = (p) => typeof p === 'string' && (p.endsWith('.env') || p.endsWith('/.env'));

  const origReadFileSync = fs.readFileSync;
  fs.readFileSync = function (path, options) {
    const result = origReadFileSync.call(this, path, options);
    if (isEnvFile(path)) return patchEnvContent(result);
    return result;
  };

  const origWriteFileSync = fs.writeFileSync;
  fs.writeFileSync = function (path, data, options) {
    if (isEnvFile(path)) data = patchEnvContent(data);
    return origWriteFileSync.call(this, path, data, options);
  };

  const origReadFile = fs.readFile;
  fs.readFile = function (path, options, callback) {
    if (typeof options === 'function') { callback = options; options = undefined; }
    const cb = (err, data) => {
      if (!err && isEnvFile(path)) data = patchEnvContent(data);
      callback(err, data);
    };
    return origReadFile.call(this, path, options, cb);
  };

  console.log('[preload] SESSION_ID injection active');
}
