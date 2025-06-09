import { InjectionToken } from '@angular/core';

// export const config: IConfig = {
//     AUTH_URL: 'https://pirldatavalidationapp.azurewebsites.net/api/GetApiTokenFum',
//     AX_RES: 'org9771c48b.operations.dynamics.com',
//     CRM_RES: 'eyomsdev.crm.dynamics.com',
//     PROJECT_ID: '876dc20e-06b7-4f8b-b87a-59313012963e', //'f4e50a06-72d5-4b3d-ab19-c4066db75034',
//     PREFIX: 'pf_',
//     exclude_entities: []
//     // AX_RES: 'org9771c48b.operations.dynamics.com',
//     // CRM_RES: 'org9771c48b.crm.dynamics.com',
//     // AUTH_URL2: 'https://pirldatavalidationapp.azurewebsites.net/api/GetDataverseTokenFun',
//     // CRM_URL: 'https://eyomsdev.crm.dynamics.com',
//     // CRM_WEBAPI_URL: 'https://eyomsdev.crm.dynamics.com/api/data/v9.2/',
//  };

export interface IConfig {
    AUTH_URL: string;
    AX_RES: string;
    CRM_RES: string;
    PROJECT_ID: string;
    PREFIX: string;
    exclude_entities: string[];
}

export const CONFIG = new InjectionToken<IConfig>('app.config');

// Default configuration
export const DEFAULT_CONFIG: IConfig = {
    AUTH_URL: 'https://pirldatavalidationapp.azurewebsites.net/api/GetApiTokenFum',
    AX_RES: 'org9771c48b.operations.dynamics.com',
    CRM_RES: 'eyomsdev.crm.dynamics.com',
    PROJECT_ID: '876dc20e-06b7-4f8b-b87a-59313012963e',
    PREFIX: 'pf_',
    exclude_entities: []
};