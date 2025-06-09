import { IsLocalEnv } from '../util';
import { HttpClient } from './http.client';
import { CrmOptionSetMeta, CrmSolution, CrmSolutionComponent, ODataResult } from '../models/crm.model';
import { CONFIG, IConfig } from '../config';
import { Injectable, Inject } from '@angular/core';

import { CrmMetaEntity, CrmMetaAttribute, CrmMetaRelationship } from '../models/meta.model';

export interface AccessToken {
    date_aquired: Date;
    access_token: string;
    token_type: string;
    expires_in: number;
    resource: string;
    refresh_token: string;
    refresh_token_expires_in: number;
    id_token: string;

}

export interface WebApiData {
    value: any;
}

@Injectable({
    providedIn: 'root'
})
export class CrmService {
    private http: HttpClient;
    private authToken: string = '';
    private authExpiresOn: string = '2020-01-01';

    httpHeaders: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        "Prefer": 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    };

    constructor(@Inject(CONFIG) private config: IConfig) {
        // this.authToken = authToken;
        this.http = new HttpClient(config);
    }

    get crmApiUrl(): string {
        return `https://${this.config.CRM_RES}/api/data/v9.2/`;
    }

    mergeRecords(primaryRecordId: string, secondaryRecordId: string, entityName: string) {
        throw new Error("Method not implemented.");
    }

    htmlEncode(s: string) {
        if (s === null || s === "" || s === undefined) return s;
        for (var count = 0, buffer = "", hEncode = "", cnt = 0; cnt < s.length; cnt++) {
            var c = s.charCodeAt(cnt);
            if (c > 96 && c < 123 || c > 64 && c < 91 || c === 32 || c > 47 && c < 58 || c === 46 || c === 44 || c === 45 || c === 95)
                buffer += String.fromCharCode(c);
            else buffer += "&#" + c + ";";
            if (++count === 500) {
                hEncode += buffer; buffer = ""; count = 0;
            }
        }
        if (buffer.length) hEncode += buffer;
        return hEncode;
    };


    crmXmlDecode(s: string | {}) {
        if (typeof s != "string") s = s.toString();
        return s;
    };

    errorHandler(req: any) {
        return new Error(JSON.parse(req.responseText).error.message);
    };

    dateReviver(key: string, value: string) {
        var a;
        if (typeof value === 'string') {
            a = /Date\(([-+]?\d+)\)/.exec(value);
            if (a) {
                return new Date(parseInt(value.replace("/Date(", "").replace(")/", ""), 10));
            }
        }
        return value;
    };

    parameterCheck(parameter: string, message: string) {
        if ((typeof parameter === "undefined") || parameter === null) {
            throw new Error(message);
        }
    };

    stringParameterCheck(parameter: string, message: string) {
        if (typeof parameter != "string") {
            throw new Error(message);
        }
    };

    callbackParameterCheck(callbackParameter: string, message: string) {
        if (typeof callbackParameter != "function") {
            throw new Error(message);
        }
    };

    booleanParameterCheck(parameter: string, message: string) {
        if (typeof parameter != "boolean") {
            throw new Error(message);
        }
    };

    numberParameterCheck(parameter: string, message: string) {
        if (typeof parameter != "number") {
            throw new Error(message);
        }
    };

    async createRecord(object: any, type: any) {
        let headers = await this.getHttpHeaders();
        let url = this.crmApiUrl + type;
        return await this.http.post(url, object, headers);
    };

    async retrieveRecord(id: string, type: string, select: string | null = null, expand: boolean | null = null): Promise<{ [key: string]: string } | undefined> {
        let headers = await this.getHttpHeaders();

        var systemQueryOptions = "";

        if (select != null || expand != null) {
            systemQueryOptions = "?";
            if (select != null) {
                var selectString = "$select=" + select;
                if (expand != null) {
                    selectString = selectString + "," + expand;
                }
                systemQueryOptions = systemQueryOptions + selectString;
            }
            if (expand != null) {
                systemQueryOptions = systemQueryOptions + "&$expand=" + expand;
            }
        }

        let url = this.crmApiUrl + type + "(" + id + ")" + systemQueryOptions;
        return this.http.get<{ [key: string]: string }>(url, headers);
    };

    async get(partialUrl: string) {
        let headers = await this.getHttpHeaders();
        let url = this.crmApiUrl + partialUrl;
        return this.http.get(url, headers);
    }

    async deleteRecord(id: string, type: string) {
        let headers = await this.getHttpHeaders();

        let url = this.crmApiUrl + type + "(" + id + ")";
        let ret = await this.http.delete(url, headers);
        return ret;
    };

    async getMetadata(entityName: string, metaAttributes: []) {
        let headers = await this.getHttpHeaders();
        var systemQueryOptions = "$filter=LogicalName eq '" + entityName + "'";

        if (metaAttributes != undefined && metaAttributes != null && metaAttributes.length > 0) {
            var selectString = "&$select=" + metaAttributes.join(',');
            systemQueryOptions = systemQueryOptions + selectString;
        }
        let url = this.crmApiUrl + "EntityDefinitions?" + systemQueryOptions;

        return this.http.get(url, headers);

    };

    async getAttributes(entityName: string) {
        // let res = await this.get(`EntityDefinitions(LogicalName='${entityName}')/Attributes?$filter=IsCustomAttribute eq true and AttributeType ne 'Virtual' and IsCustomAttribute eq true and IsValidForCreate eq true&$select=LogicalName,DisplayName,SchemaName,AttributeType,IsCustomAttribute,IsPrimaryName,IsPrimaryId,Targets`);
        let res = await this.get(`EntityDefinitions(LogicalName='${entityName}')/Attributes?$filter=IsCustomAttribute eq true and AttributeType ne 'Virtual' and IsCustomAttribute eq true and IsValidForCreate eq true`);
        return res;
    }

    async getOptionSets(entityName: string) {
        // let res = await this.crmService.get("EntityDefinitions(LogicalName='account')/Attributes");
        let res = await this.get(`EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet`);
        return res;
    }

    async getSessionEntries(chatSessionId: string) {
        // let res = await this.crmService.get("EntityDefinitions(LogicalName='account')/Attributes");
        let res = await this.get(`pf_chatentries?$filter=pf_chatsession eq '${chatSessionId}'`);
        return res;
    }

    async getEntities(): Promise<any> {
        // let res = await this.crmService.get("EntityDefinitions(LogicalName='account')/Attributes");
        let res = await this.get(`EntityDefinitions()?$select=LogicalName,DisplayName,SchemaName,MetadataId,DisplayName,Description,IsCustomEntity,ObjectTypeCode&$filter=TableType ne 'Virtual' and IsCustomEntity eq true`);
        return Promise.resolve(res);
    }

    async getMetadataAllEntities(metaAttributes: []) {
        let headers = await this.getHttpHeaders();

        var systemQueryOptions = "$filter=IsImportable eq true";

        if (metaAttributes != undefined && metaAttributes != null) {
            var selectString = "&$select=" + metaAttributes.join(',');
            systemQueryOptions = systemQueryOptions + selectString;
        }

        let url = this.crmApiUrl + "EntityDefinitions?" + systemQueryOptions;
        return this.http.get(url, headers);

    };

    async getMetadataByQuery(query: string) {
        let headers = await this.getHttpHeaders();
        let url = this.crmApiUrl + "EntityDefinitions?" + query;
        return this.http.get(url, headers);
    };

    async getMetadataAllAttributes(metadataId: string, metaAttributes: string[] = []) {
        let headers = await this.getHttpHeaders();
        var systemQueryOptions = '';

        if (metaAttributes != undefined && metaAttributes != null && metaAttributes.length > 0) {
            var selectString = "&$select=" + metaAttributes.join(',');
            systemQueryOptions = `?${systemQueryOptions}${selectString}`;
        }

        let url = this.crmApiUrl + "EntityDefinitions(" + metadataId + ")/Attributes" + systemQueryOptions;
        return this.http.get(url, headers);

    };

    async getMetadataGlobalOptionSetById(GlobalOptionSetId: string) {
        let headers = await this.getHttpHeaders();
        let url = this.crmApiUrl + "GlobalOptionSetDefinitions(" + GlobalOptionSetId + ")";
        return this.http.get(url, headers);
    };

    async retrieveMultipleRecords(type: string, options: string): Promise<ODataResult> {
        let headers = await this.getHttpHeaders();
        var optionsString = '';
        if (options != null) {
            if (options.charAt(0) != "?") {
                optionsString = "?" + options;
            }
            else {
                optionsString = options;
            }
        }

        let url = this.crmApiUrl + type + optionsString;

        return this.http.get<ODataResult>(url, headers);
    };

    async updateRecord(id: string, object: {}, type: string) {
        let headers = await this.getPatchHttpHeaders();

        let url = this.crmApiUrl + type + "(" + id + ")";
        return this.http.patch(url, object, headers);
    };

    async associateRecord(recordId: string, entitySetName: string, relatedRecordId: string, relatedEntitySetName: string, relationship: string) {
        let headers = this.getHttpHeaders();

        var serviceUrl = this.crmApiUrl;
        var associate = {
            "@odata.id": serviceUrl + relatedEntitySetName + "(" + relatedRecordId + ")"
        };
        let url = serviceUrl + entitySetName + "(" + recordId + ")/" + relationship + "/$ref";

        return this.http.post(url, associate, await headers);
    }

    async sentEmail(email: any) {
        let headers = await this.getHttpHeaders();

        var serviceUrl = this.crmApiUrl;
        let url = serviceUrl + 'emails';

        const response = await this.http.post(url, email, headers);

    }

    async fetch<T>(type: string, fetchXml: string): Promise<ODataResult> {
        let headers = await this.getHttpHeaders();
        let url = this.crmApiUrl + type + '?fetchXml=' + encodeURI(fetchXml);
        let res = await this.http.get<T>(url, headers);
        return new ODataResult(res);

    };

    async setStateRequest(type: string, id: string, stateCode: number, statusCode: number) {
        let headers = await this.getHttpHeaders();
        var object: any = {};
        object.statecode = stateCode;
        object.statuscode = statusCode;

        let url = this.crmApiUrl + type + "(" + id + ")";
        return this.http.post(url, object, headers);

    };

    async callAction(actionName: string, id: string, entitySetName: string, params: {}) {
        let headers = await this.getHttpHeaders();
        var query = "";
        if (entitySetName != null)
            query = entitySetName + "(" + id + ")/Microsoft.Dynamics.CRM." + actionName;
        else
            query = actionName;

        let url = this.crmApiUrl + query;

        return this.http.post(url, params, headers);
    }

    async getHttpHeaders(): Promise<Record<string, string>> {
        if (IsLocalEnv()) {
            await this.checkAuthToken();
            return {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                //'MSCRM.SolutionUniqueName': 'PFDemo',
                "Prefer": 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
                'Authorization': `Bearer ${this.authToken}`
            };
        } else {
            return {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                "Prefer": 'odata.include-annotations="OData.Community.Display.V1.FormattedValue"'
            };

        }

    }

    async checkAuthToken() {
        let now = new Date();
        let tokenExp = new Date(this.authExpiresOn);

        if (tokenExp.getTime() - 60000 < now.getTime())
            await this.renewToken();
    }

    async renewToken() {
        let http = new HttpClient(this.config);
        //let jsonRes = await http.get<any>("https://pirldatavalidationapp.azurewebsites.net/api/GetDataverseTokenFun");
        let jsonRes = await http.get<any>(`${this.config.AUTH_URL}?resource=${this.config.CRM_RES}`);
        this.authToken = jsonRes.accessToken;
        this.authExpiresOn = jsonRes.expiresOn;
    }


    getPatchHttpHeaders(): Record<string, string> {
        if (IsLocalEnv())
            return {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'X-HTTP-Method': 'MERGE',
                'Authorization': `Bearer ${this.authToken}`
            };

        return {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'X-HTTP-Method': 'MERGE'
        };
    }

    logMessage(ctx: any, message: string) {
        if(ctx)
            ctx.Trace(message);
    }

    async createEntity(me: CrmMetaEntity, ctx: any = null): Promise<boolean> {
        let updated = false;
        if (!me.schemaName)
            me.schemaName = "pf_" + translateToSchemaName(me.displayName);

        let entityMetaResp: any = await this.getMetadata(me.schemaName, []);
        if (entityMetaResp.value.length > 0) {
            me.metadataId = entityMetaResp.value[0].MetadataId;
            
            this.logMessage(ctx, `Entity ${me.displayName} (${me.schemaName}) already exists`);
            
            return await this.updateEntity(me, ctx);
        }

        const payload = {
            "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
            Attributes: me.attrs.map((attr) => attr.toPayload()),
            Description: {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                LocalizedLabels: [{ "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": me.description, "LanguageCode": 1033 }]
            },
            DisplayCollectionName: {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                LocalizedLabels: [{ "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": me.displayCollectionName, "LanguageCode": 1033 }]
            },
            DisplayName: {
                "@odata.type": "Microsoft.Dynamics.CRM.Label",
                LocalizedLabels: [{ "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": me.displayName, "LanguageCode": 1033 }]
            },
            HasActivities: me.hasActivities,
            HasNotes: me.hasNotes,
            IsActivity: me.isActivity,
            OwnershipType: me.ownershipType,
            SchemaName: me.schemaName,
        }

        let headers = await this.getHttpHeaders();
        let baseUrl = `${this.crmApiUrl}EntityDefinitions`;

        try {
            const response = await this.http.post(baseUrl, payload, headers);
            updated = true;
            await this.createLookups(me);
            await this.publishEntity(me.schemaName);
        } catch (error: any) {
            throw new Error(`Failed to create entity: ${error.response?.data?.error?.message || error.message}`);
        }
        
        return updated;

    }


    async createLookups(me: CrmMetaEntity) {
        let lookups = me.lookups;
        for (let i = 0; i < lookups.length; i++) {
            let lookup = lookups[i];
            await this.createLookup(me.schemaName, lookup);
        }
    }

    async createLookup(referencingEntity: string, lookup: CrmMetaAttribute): Promise<boolean> {
        let rel = new CrmMetaRelationship(referencingEntity, lookup.targetEntityName, lookup.schemaName, lookup.displayName);
        return await this.createRelashionship(rel);
    }

    async createAttribute(entitySchemaName: string, ma: CrmMetaAttribute): Promise<boolean> {
        let updated = false;
        if (!ma.schemaName)
            ma.schemaName = "pf_" + translateToSchemaName(ma.displayName);

        const payload = ma.toPayload();

        let headers = await this.getHttpHeaders();
        let baseUrl = `${this.crmApiUrl}EntityDefinitions(LogicalName='${entitySchemaName}')/Attributes`;

        try {
            const response = await this.http.post(baseUrl, payload, headers);
            updated = true;
        } catch (error: any) {
            throw new Error(`Failed to create attribute: ${error.response?.data?.error?.message || error.message}`);
        }
        return updated;
    }

    async createRelashionship(ma: CrmMetaRelationship): Promise<boolean> {
        let updated = false;
        const payload = ma.toPayload();

        let headers = await this.getHttpHeaders();
        let baseUrl = `${this.crmApiUrl}RelationshipDefinitions`;

        try {
            let foundRel = await this.relationshipExists(ma);
            if (foundRel)
                return updated;
        } catch (error) {
            console.log('skipped relationship because it already exists');
        }

        try {
            const response = await this.http.post(baseUrl, payload, headers);
            updated = true;
        } catch (error: any) {
            throw new Error(`Failed to create relationship: ${error.response?.data?.error?.message || error.message}`);
        }
        return updated;
    }
    
    async updateEntity(me: CrmMetaEntity, ctx: any): Promise<boolean> {
        let updated = false;
        let attrs: any = await this.getMetadataAllAttributes(me.metadataId, ['LogicalName', 'AttributeType']);
        let optionSetMetaTuple: {} | null = null;

        for (let i = 0; i < me.attributes.length; i++) {
            let attr: CrmMetaAttribute = me.attributes[i];
            let foundAttr = attrs.value.find((x: any) => x.LogicalName.toLowerCase() == attr.schemaName.toLowerCase()?.toLowerCase());
            if (!foundAttr) {
                this.logMessage(ctx, `creating attribute: ${attr.schemaName}`);
                if(attr.attributeType.toLowerCase() == 'lookup')
                    await this.createLookup(me.schemaName, attr);
                else
                    await this.createAttribute(me.schemaName, attr);
                updated = true;
            } else {
                if(optionSetMetaTuple == null)
                    optionSetMetaTuple = await this.getOptionSetsMeta(me.schemaName) as {};

                let _updated = await this.updateAttribute(me.schemaName, attr, optionSetMetaTuple, ctx);
                updated = updated || _updated;
            } 

        }
        if(updated) {
            this.publishEntity(me.schemaName);
        }
        return updated;
    }

    async updateAttribute(entityLogicalName: string, attr: CrmMetaAttribute, optionSetMetaTuple: any, ctx: any = null): Promise<boolean> {
        let updated = false;
        if(attr.attributeType != 'Picklist') {
            console.warn(`skipping attribute: ${attr.schemaName}`);
            return updated;
        }

        this.logMessage(ctx, `updating attribute: ${attr.schemaName}`);
        let optionSetsMap = optionSetMetaTuple[1];
        let optionSet = optionSetsMap[attr.schemaName];
        if(!optionSet) {
            console.warn(`option set not found for attribute: ${attr.schemaName}`);
            return updated;
        }
        for(let i = 0; i < attr.options.length; i++) {
            let label = attr.options[i];
            let option = optionSet.Options.find((x: any) => x.Label == label);
            if(!option) {
                let maxIndex = optionSet.Options.reduce((acc: number, opt: any) => {
                    if(opt.Value > acc)
                        acc = opt.Value;
                    return acc;
                }, 0);
                await this.insertOption(entityLogicalName, attr.schemaName, label, maxIndex + 1);
                updated = true;
                optionSet.Options.push({Value: maxIndex + 1, Label: label});
            }
        }

        if(updated)
            this.logMessage(ctx, `attribute ${attr.schemaName} updated`);

        return updated;
        
    }

    async insertOption(entityLogicalName: string, attributeLogicalName: string, label: string, value: number) {
        let headers = await this.getHttpHeaders();
        let resourceUrl = `${this.crmApiUrl}InsertOptionValue`;
        let payload = {
            "AttributeLogicalName": attributeLogicalName,
            "EntityLogicalName": entityLogicalName,
            "Value": value,
            "Label": {
              "@odata.type": "Microsoft.Dynamics.CRM.Label",
              "LocalizedLabels": [
                {
                  "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                  "Label": label,
                  "LanguageCode": 1033,
                  "IsManaged": false
                }
              ],
              "UserLocalizedLabel": {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": label,
                "LanguageCode": 1033,
                "IsManaged": false
              }
            }
          }

        try {
            const response = await this.http.post(resourceUrl, payload, headers);
            return JSON.stringify(response);
        } catch (error: any) {
            throw new Error(`Failed to create attribute: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async getOptionSetsMeta(entiyLogicalName: string): Promise<[CrmOptionSetMeta[], any]> {
        let tuple: [CrmOptionSetMeta, any];        
        let results = await this.getOptionSets(entiyLogicalName) as ODataResult;
        let optionSets: CrmOptionSetMeta[] = [];
        let optionSetMap: any = {};
        if (results) {
            results.value.forEach((res: any) => {
                let optionSet: CrmOptionSetMeta = {
                    LogicalName: res.LogicalName,
                    DisplayName: '',
                    Options: [],
                    Id2Name: {},
                    Name2Id: {}

                };
                optionSet.Options = res.OptionSet.Options.map((opt: any) => {
                    return {
                        Value: opt.Value,
                        Label: opt.Label.UserLocalizedLabel.Label
                    }
                });
                optionSet.Id2Name = optionSet.Options.reduce((acc: any, opt: any) => {
                    acc[opt.Value] = opt.Label;
                    return acc;
                }, {});
                optionSet.Name2Id = optionSet.Options.reduce((acc: any, opt: any) => {
                    acc[opt.Label] = opt.Value;
                    return acc;
                }, {});
                optionSets.push(optionSet);
            });
            optionSetMap = optionSets.reduce((acc: any, optSet: CrmOptionSetMeta) => {
                acc[optSet.LogicalName] = optSet;
                return acc;
            }, {});
            
        }
        return [optionSets, optionSetMap];
    }




    async relationshipExists(ma: CrmMetaRelationship): Promise<boolean> {
        let headers = await this.getHttpHeaders();
        let baseUrl = `${this.crmApiUrl}RelationshipDefinitions(SchemaName='${ma.name}')`;

        try {
            await this.http.get(baseUrl, headers);
            return true;
        } catch (error: any) {
            return false;
        }
    }

    async deleteEntity(logicalName: string): Promise<string> {

        let headers = await this.getHttpHeaders();
        let baseUrl = `${this.crmApiUrl}EntityDefinitions(LogicalName='${logicalName}')`;

        try {
            const response = await this.http.delete(baseUrl, headers);
            return JSON.stringify(response);
        } catch (error: any) {
            throw new Error(`Failed to delete lookup: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async createApp(name: string): Promise<string> {
        let headers = await this.getHttpHeaders();
        let baseUrl = 'https://eyomsdev.crm.dynamics.com/api/data/v9.0/appmodules'; //`${this.crmApiUrl}appmodules `;
        let body = {
            name: name,
            uniquename: name.replace(/ /g, ''),
            webresourceid: "953b9fac-1e5e-e611-80d6-00155ded156f"
        }

        try {
            const response = await this.http.post(
                baseUrl,
                body,
                headers
            );

            return `Model driven app [${name}] created successfully.`;
        } catch (error: any) {
            throw new Error(`Failed to create model driven app [${name}]: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    async addComponentToApp(appId: string, viewId: string, formId: string): Promise<string> {

        let headers = await this.getHttpHeaders();
        let baseUrl = `https://eyomsdev.crm.dynamics.com/api/data/v9.0/AddAppComponents`;
        let body = {
            "AppId": `${appId}`,
            "Components": [
                {
                    "savedqueryid": viewId,
                    "@odata.type": "Microsoft.Dynamics.CRM.savedquery"
                },
                {
                    "formid": formId,
                    "@odata.type": "Microsoft.Dynamics.CRM.systemform"
                }
            ]
        }

        try {
            const response = await this.http.post(
                baseUrl,
                body,
                headers
            );

            return `View ${viewId}, Form ${formId} added to App ${appId}]`;
        } catch (error: any) {
            throw new Error(`Failed to create model driven app [${name}]: ${error.response?.data?.error?.message || error.message}`);
        }
    }



    async getSolutions(): Promise<CrmSolution[]> {
        const url = `${this.crmApiUrl}/solutions`;
        let headers = await this.getHttpHeaders();
        let resp = await this.http.get<any>(url, headers);

        return resp.value;

    }

    async getSolutionComponents(solutionId: string): Promise<CrmSolutionComponent[]> {
        const url = `${this.crmApiUrl}solutioncomponents?$filter=_solutionid_value eq '${solutionId}' and componenttype eq 1`;  // 1 = Entity
        let headers = await this.getHttpHeaders();
        let response = await this.http.get<any>(url, headers);
        return response.value.map((component: any) => ({
            ...component,
            componenttypename: this.getComponentTypeName(component.componenttype)
        }));
    }

    async addComponentToSolution(solutionId: string, componentData: any): Promise<any> {
        const url = `${this.crmApiUrl}AddSolutionComponent`;
        const data = {
            SolutionUniqueName: solutionId,
            ComponentType: componentData.componenttype,
            ComponentId: componentData.objectid
        };
        let headers = await this.getHttpHeaders();

        return this.http.post(url, data, headers);
    }

    private getComponentTypeName(componentType: number): string {
        const componentTypes: { [key: number]: string } = {
            1: 'Entity',
            2: 'Attribute',
            3: 'Relationship',
            4: 'Attribute Picklist Value',
            5: 'Attribute Lookup Value',
            6: 'View Attribute',
            7: 'Localized Label',
            8: 'Relationship Extra Condition',
            9: 'Option Set',
            10: 'Entity Relationship',
            11: 'Entity Relationship Role',
            12: 'Entity Relationship Relationships',
            13: 'Managed Property',
            14: 'Entity Key',
            16: 'Privilege',
            20: 'Role',
            21: 'Role Privilege',
            22: 'Display String',
            23: 'Display String Map',
            24: 'Form',
            25: 'Organization',
            26: 'Saved Query',
            29: 'Workflow',
            31: 'Report',
            32: 'Report Entity',
            33: 'Report Category',
            34: 'Report Visibility',
            35: 'Attachment',
            36: 'Email Template',
            37: 'Contract Template',
            38: 'KB Article Template',
            39: 'Mail Merge Template',
            44: 'Duplicate Rule',
            45: 'Duplicate Rule Condition',
            46: 'Entity Map',
            47: 'Attribute Map',
            48: 'Ribbon Command',
            49: 'Ribbon Context Group',
            50: 'Ribbon Customization',
            52: 'Ribbon Rule',
            53: 'Ribbon Tab To Command Map',
            55: 'Web Resource',
            60: 'Process',
            61: 'System Form',
            62: 'Security Role'
        };

        return componentTypes[componentType] || 'Unknown';
    }

    async createCustomForm(entityName: string, formName: string, formType: number, formXml: string): Promise<string> {
        const formData = {
            name: formName,
            description: `Custom form for ${entityName}`,
            formactivationstate: 1, // Active form
            objecttypecode: entityName,
            type: formType, // 2 = Main form, 7 = Quick Create form, etc.
            formxml: formXml
        };

        let headers = await this.getHttpHeaders();
        let resourceUrl = `${this.crmApiUrl}systemforms`;
        try {
            const response = await fetch(resourceUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                return result.systemformid;
            } else {
                const error = await response.json();
                throw new Error(`Failed to create form: ${error.error.message}`);
            }
        } catch (error) {
            console.error("Error creating form:", error);
            throw error;
        }

    }

    async updateFormXml(formId: string, newFormXml: string): Promise<void> {
        let headers = await this.getHttpHeaders();
        let resourceUrl = `${this.crmApiUrl}systemforms(${formId})`;
        try {
            const response = await fetch(resourceUrl, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({
                    formxml: newFormXml
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to update form: ${error.error.message}`);
            }
        } catch (error) {
            console.error("Error updating form:", error);
            throw error;
        }
    }


    delay(seconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
    async publishEntity(entityName: string): Promise<void> {
        console.log(`Publishing entity: ${entityName}`);
        let headers = await this.getHttpHeaders();
        let resourceUrl = `${this.crmApiUrl}PublishXml`;
        const publishXml = `<importexportxml><entities><entity>${entityName}</entity></entities></importexportxml>`;

        try {
            await fetch(resourceUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    ParameterXml: publishXml
                })
            });
            console.log("Waiting for 10 seconds...");
            await this.delay(10);
            console.log("Done waiting.");
            console.log("Entity published successfully");
        } catch (error) {
            console.error("Error publishing entity:", error);
            throw error;
        }

    }

    async publishApp(appId: string): Promise<void> {
        let headers = await this.getHttpHeaders();
        let resourceUrl = `${this.crmApiUrl}PublishXml`;
        const publishXml = `<importexportxml><appmodules><appmodule>${appId}</appmodule></appmodules></importexportxml>`;

        try {
            await fetch(resourceUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    ParameterXml: publishXml
                })
            });
            console.log("App published successfully");
        } catch (error) {
            console.error("Error publishing App:", error);
            throw error;
        }
    }
}


export class Common {
    guidsAreEqual(guid1: string, guid2: string) {
        var isEqual;
        if (guid1 === null || guid2 === null || guid1 === undefined || guid2 === undefined) {
            isEqual = false;
        }
        else {
            isEqual = guid1.replace(/[{}]/g, "").toLowerCase() === guid2.replace(/[{}]/g, "").toLowerCase();
        }

        return isEqual;
    };

    showError(error: any) {
        alert(error.message);
    };

    calculateDaysBetween(datetime1: Date, datetime2: Date) {
        var oneDay = 1000 * 60 * 60 * 24;
        var date1Ms = datetime1.getTime();
        var date2Ms = datetime2.getTime();
        var differenceMs = Math.abs(date1Ms - date2Ms); // Convert back to days and return
        return Math.round(differenceMs / oneDay);
    };
}


function translateToSchemaName(displayName: string) {
    const pattern = /[^a-zA-Z0-9]/g;
    let schemaName = displayName.replace(/ /, '_').replace(/[^a-zA-Z0-9_]/g, '')
    return schemaName;

}

