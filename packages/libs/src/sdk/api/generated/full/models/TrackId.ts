/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface TrackId
 */
export interface TrackId {
    /**
     * 
     * @type {string}
     * @memberof TrackId
     */
    id: string;
}

/**
 * Check if a given object implements the TrackId interface.
 */
export function instanceOfTrackId(value: object): value is TrackId {
    let isInstance = true;
    isInstance = isInstance && "id" in value && value["id"] !== undefined;

    return isInstance;
}

export function TrackIdFromJSON(json: any): TrackId {
    return TrackIdFromJSONTyped(json, false);
}

export function TrackIdFromJSONTyped(json: any, ignoreDiscriminator: boolean): TrackId {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
    };
}

export function TrackIdToJSON(value?: TrackId | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
    };
}

