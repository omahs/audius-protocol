// @ts-nocheck
/* tslint:disable */
/* eslint-disable */
/**
 * API
 * Audius V1 API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    PlaylistArtwork,
    PlaylistArtworkFromJSON,
    PlaylistArtworkFromJSONTyped,
    PlaylistArtworkToJSON,
} from './PlaylistArtwork';
import {
    User,
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * 
 * @export
 * @interface Playlist
 */
export interface Playlist {
    /**
     * 
     * @type {PlaylistArtwork}
     * @memberof Playlist
     */
    artwork?: PlaylistArtwork;
    /**
     * 
     * @type {string}
     * @memberof Playlist
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof Playlist
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof Playlist
     */
    is_album: boolean;
    /**
     * 
     * @type {string}
     * @memberof Playlist
     */
    playlist_name: string;
    /**
     * 
     * @type {number}
     * @memberof Playlist
     */
    repost_count: number;
    /**
     * 
     * @type {number}
     * @memberof Playlist
     */
    favorite_count: number;
    /**
     * 
     * @type {number}
     * @memberof Playlist
     */
    total_play_count: number;
    /**
     * 
     * @type {User}
     * @memberof Playlist
     */
    user: User;
}

