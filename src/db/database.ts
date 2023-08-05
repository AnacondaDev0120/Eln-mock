import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const sequelizeConfig :SequelizeOptions = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  logging: false,
};

const sequelize = new Sequelize(sequelizeConfig);

sequelize.addModels([User]);
export default sequelize;
