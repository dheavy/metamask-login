import os from 'os';
import path from 'path';
import { INTEGER, Sequelize, STRING } from 'sequelize';
import { User } from './models';

const sequelize = new Sequelize('metamask-login', '', undefined, {
  dialect: 'sqlite',
  storage: path.join(os.tmpdir(), 'db.sqlite'),
  logging: false
});

User.init({
  nonce: {
    allowNull: false,
    type: INTEGER.UNSIGNED,
    defaultValue: (): number => Math.floor(Math.random() * 10000),
  },
  address: {
    allowNull: false,
    type: STRING,
    unique: true,
    validate: { isLowercase: true }
  },
  username: {
    type: STRING,
    unique: true
  }
}, {
  modelName: 'user',
  sequelize,
  timestamps: false
});

sequelize.sync();

export { sequelize };
