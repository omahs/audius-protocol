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
    PlaylistFull,
    PlaylistFullFromJSON,
    PlaylistFullFromJSONTyped,
    PlaylistFullToJSON,
} from './PlaylistFull';
import {
    VersionMetadata,
    VersionMetadataFromJSON,
    VersionMetadataFromJSONTyped,
    VersionMetadataToJSON,
} from './VersionMetadata';

/**
 * 
 * @export
 * @interface FullPlaylistResponse
 */
export interface FullPlaylistResponse {
    /**
     * 
     * @type {number}
     * @memberof FullPlaylistResponse
     */
    latest_chain_block: number;
    /**
     * 
     * @type {number}
     * @memberof FullPlaylistResponse
     */
    latest_indexed_block: number;
    /**
     * 
     * @type {number}
     * @memberof FullPlaylistResponse
     */
    latest_chain_slot_plays: number;
    /**
     * 
     * @type {number}
     * @memberof FullPlaylistResponse
     */
    latest_indexed_slot_plays: number;
    /**
     * 
     * @type {string}
     * @memberof FullPlaylistResponse
     */
    signature: string;
    /**
     * 
     * @type {string}
     * @memberof FullPlaylistResponse
     */
    timestamp: string;
    /**
     * 
     * @type {VersionMetadata}
     * @memberof FullPlaylistResponse
     */
    version: VersionMetadata;
    /**
     * 
     * @type {Array<PlaylistFull>}
     * @memberof FullPlaylistResponse
     */
    data?: Array<PlaylistFull>;
}

