/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class UsersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get a user by ID
     * @param id User ID
     * @returns User Returns user information
     * @throws ApiError
     */
    public usersControllerFindOne(
        id: string,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Update user profile
     * @param requestBody User profile data to update
     * @returns User Profile updated successfully
     * @throws ApiError
     */
    public usersControllerUpdateProfile(
        requestBody: UpdateProfileDto,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/users/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
