// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
/**
 * API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    UserFull,
    UserFullFromJSON,
    UserFullFromJSONTyped,
    UserFullToJSON,
} from './UserFull';
import {
    VersionMetadata,
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface FollowingResponseFull
 */
export interface FollowingResponseFull {
    /**
     * 
     * @type {number}
     * @memberof FollowingResponseFull
     */
    latest_chain_block: number;
    /**
     * 
     * @type {number}
     * @memberof FollowingResponseFull
     */
    latest_indexed_block: number;
    /**
     * 
     * @type {number}
     * @memberof FollowingResponseFull
     */
    latest_chain_slot_plays: number;
    /**
     * 
     * @type {number}
     * @memberof FollowingResponseFull
     */
    latest_indexed_slot_plays: number;
    /**
     * 
     * @type {string}
     * @memberof FollowingResponseFull
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof FollowingResponseFull
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof FollowingResponseFull
     */
    version: VersionMetadata;
    /**
     * 
     * @type {Array<UserFull>}
     * @memberof FollowingResponseFull
     */
    data?: Array<UserFull>;
}

