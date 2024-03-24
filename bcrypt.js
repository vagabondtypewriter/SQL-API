const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * Function to check if a password is correct by comparing it to the hashed password.
 * @param {string} inputPassword The password given as input for a log in
 * @param {string} retrievedData The password retrieved from the database of a user that is trying to be logged in
 */
function passwordIsCorrect(inputPassword, retrievedData) {
  bcrypt.compare(inputPassword, retrievedData.password, function(err, result) {
    console.log("Testing this password:", inputPassword);
        if (err) {
          console.error("\tError comparing passwords:", err);
          return;
        }
        if (result) {
          console.log("\tSame password!")
          return true;
        } else {
          console.log("\tDifferent password!");
          return false;
        }
  });
}

/**
 * Function to encrypt a given string, then save it to the database
 * 
 * @param {string} inputPassword The password that is to be encrypted
 */
function encryptPassword(inputPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(inputPassword, saltRounds, function(err, hash) {
      if (err) {
        console.error("Error hashing:", err);
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });
}

module.exports = {passwordIsCorrect, encryptPassword};