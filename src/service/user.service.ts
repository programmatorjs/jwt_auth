import {omit} from 'lodash';
import {FilterQuery, QueryOptions} from 'mongoose';
import config from 'config';
import userModel, {User} from '../models/user.model';
import {excludedFields} from '../controllers/auth.controller';
import {signJwt} from '../utils/jwt';
import redisClient from '../utils/connectRedis';
import {DocumentType} from '@typegoose/typegoose';


export const createUser = async (input: Partial<User>) => {
    const user = await userModel.create(input);
    return omit(user.toJSON(), excludedFields);
};


export const findUserById = async (id: string) => {
    const user = await userModel.findById(id).lean();
    return omit(user, excludedFields);
};


export const findAllUsers = async () => {
    return userModel.find();
};


export const findUser = async (
    query: FilterQuery<User>,
    options: QueryOptions = {}
) => {
    return userModel.findOne(query, {}, options).select('+password');
};


export const signToken = async (user: DocumentType<User>) => {
    const access_token = signJwt(
        {sub: user._id},
        {
            expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
        }
    );

    try {
        await redisClient.set(user._id.toString(), JSON.stringify(user), {
            EX: 60 * 60,
        });
        console.log('User data saved to Redis');
    } catch (err: any) {
        console.error('Error saving user data to Redis:', err);
    }

    return {access_token};
};


