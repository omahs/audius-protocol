/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
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

import { exists, mapValues } from '../runtime';
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * 
 * @export
 * @interface Supporting
 */
export interface Supporting {
    /**
     * 
     * @type {number}
     * @memberof Supporting
     */
    rank: number;
    /**
     * 
     * @type {string}
     * @memberof Supporting
     */
    amount: string;
    /**
     * 
     * @type {User}
     * @memberof Supporting
     */
    receiver: User;
}

/**
 * Check if a given object implements the Supporting interface.
 */
export function instanceOfSupporting(value: object): value is Supporting {
    let isInstance = true;
    isInstance = isInstance && "rank" in value && value["rank"] !== undefined;
    isInstance = isInstance && "amount" in value && value["amount"] !== undefined;
    isInstance = isInstance && "receiver" in value && value["receiver"] !== undefined;

    return isInstance;
}

export function SupportingFromJSON(json: any): Supporting {
    return SupportingFromJSONTyped(json, false);
}

export function SupportingFromJSONTyped(json: any, ignoreDiscriminator: boolean): Supporting {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'rank': json['rank'],
        'amount': json['amount'],
        'receiver': UserFromJSON(json['receiver']),
    };
}

export function SupportingToJSON(value?: Supporting | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'rank': value.rank,
        'amount': value.amount,
        'receiver': UserToJSON(value.receiver),
    };
}

