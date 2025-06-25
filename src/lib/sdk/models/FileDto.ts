/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FileDto = {
    /**
     * File ID
     */
    id: string;
    /**
     * File storage key/path
     */
    key: string;
    /**
     * Original filename
     */
    filename: string;
    /**
     * File MIME type
     */
    mimetype: string;
    /**
     * File size in bytes
     */
    size?: number;
    /**
     * Storage bucket name
     */
    bucket: string;
    /**
     * User ID who uploaded the file
     */
    uploadedBy?: string;
    /**
     * User ID who owns the file
     */
    userId?: string;
    /**
     * File status
     */
    status: FileDto.status;
    /**
     * File creation date
     */
    createdAt: string;
    /**
     * File last update date
     */
    updatedAt: string;
};
export namespace FileDto {
    /**
     * File status
     */
    export enum status {
        PENDING = 'PENDING',
        UPLOADED = 'UPLOADED',
        FAILED = 'FAILED',
    }
}

