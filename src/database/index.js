const connection = require('./connection');
const { initializeDatabase } = require('./schema');

module.exports = { ...connection, initializeDatabase };
