import { Sequelize } from "sequelize"
import db from "../config/database.js"

const { DataTypes } = Sequelize;

const User = db.define("user", {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  refresh_token: Sequelize.TEXT,
}, {
  freezeTableName: true 
});

db.sync().then(() => console.log("Database synced"));

export default User;
