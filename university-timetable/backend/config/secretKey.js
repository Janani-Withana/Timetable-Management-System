secretKey.js
const fs = require('fs');
const crypto = require('crypto');

const secretKeyPath = 'secret.key'; // Adjust the path as needed

let secretKey;

try {
  // Try to read the secret key from the file
  secretKey = fs.readFileSync(secretKeyPath, 'utf-8');
  
} catch (err) {
  // If the file doesn't exist, generate a new secret key
  secretKey = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretKeyPath, secretKey, 'utf-8');
}

module.exports = secretKey;

