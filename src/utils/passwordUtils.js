const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
    // Generate a salt (random string) to add to the password before hashing.
    // 10 is the number of salt rounds; higher values mean more secure but slower.
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the generated salt
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    // Compare the plain text password with the hashed password
    return bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
