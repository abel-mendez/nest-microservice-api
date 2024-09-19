import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { NewUserDto } from '../dtos/new-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  private readonly _logger = new Logger(UserRepository.name);
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<User>,
  ) {}

  async createUser(newUserDto: NewUserDto): Promise<UserDocument> {
    try {
      const newUser = new this._userModel(newUserDto);
      return await newUser.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('User already exists');
      }
      this._logger.error(error.message);
      throw new Error('Internal server error');
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      return this._userModel.findOne({
        email,
      });
    } catch (error) {
      this._logger.error(error.message);
      throw new Error('Internal server error');
    }
  }

  async paginate(
    from: number,
    size: number,
    email?: string,
  ): Promise<UserDocument[]> {
    try {
      const filter = email ? { email: { $regex: new RegExp(email, 'i') } } : {};
      return await this._userModel
        .find(filter)
        .skip(from)
        .limit(size)
        .select('-password')
        .exec();
    } catch (error) {
      this._logger.error(error.message);
      throw new Error('Internal server error');
    }
  }
}
