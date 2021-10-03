import { Model } from 'sequelize';

export class User extends Model {
  public id!: number;
  public nonce!: number;
  public address!: string;
  public username?: string;
}
