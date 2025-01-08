const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  // Primary Key 
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true, // Ensure it auto increments
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Enforce unique usernames
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Enforce unique emails
    validate: {
      isEmail: true, // Ensures that it's a valid email format
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  saved_collections: {
    type: DataTypes.ARRAY(DataTypes.STRING), // List of collection IDs
    allowNull: true,
    defaultValue: [],
  },
}, {
  hooks: {
    // Hook to hash password before saving to the DB
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    // Hook to hash password before updating (in case of password changes)
    beforeUpdate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
  tableName: 'Users', 
  timestamps: true, // By default Sequelize adds createdAt and updatedAt
});

module.exports = User;
