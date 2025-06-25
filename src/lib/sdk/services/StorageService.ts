/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfirmUploadDto } from '../models/ConfirmUploadDto';
import type { CreatePresignedUrlDto } from '../models/CreatePresignedUrlDto';
import type { PresignedUrlResponseDto } from '../models/PresignedUrlResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StorageService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get a presigned URL for uploading a file to S3
     * @param requestBody
     * @returns PresignedUrlResponseDto Returns a presigned URL for direct upload to S3
     * @throws ApiError
     */
    public storageControllerCreatePresignedUrl(
        requestBody: CreatePresignedUrlDto,
    ): CancelablePromise<PresignedUrlResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/storage/presigned-url',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Confirm that a file was successfully uploaded to S3
     * @param requestBody
     * @returns any File upload confirmed
     * @throws ApiError
     */
    public storageControllerConfirmUpload(
        requestBody: ConfirmUploadDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/storage/confirm-upload',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a presigned URL for downloading a file from S3
     * @param fileId
     * @returns any Returns a presigned URL for downloading the file
     * @throws ApiError
     */
    public storageControllerGetDownloadUrl(
        fileId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/storage/download/{fileId}',
            path: {
                'fileId': fileId,
            },
        });
    }
    /**
     * Get all files for the current user
     * @returns any Returns a list of files for the user
     * @throws ApiError
     */
    public storageControllerGetUserFiles(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/storage/files',
        });
    }
    /**
     * Delete a file
     * @param fileId
     * @returns any File deleted successfully
     * @throws ApiError
     */
    public storageControllerDeleteFile(
        fileId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/storage/{fileId}',
            path: {
                'fileId': fileId,
            },
        });
    }
}
