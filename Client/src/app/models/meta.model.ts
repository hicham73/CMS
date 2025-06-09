import { CrmEntityMeta, CrmOptionSetMeta } from "./crm.model";
import { Project } from "./core.model";


export class CrmMetaEntity {
  metadataId: string;
  schemaName: string;
  displayName: string;
  description: string;
  displayCollectionName: string;
  attributes: CrmMetaAttribute[];
  ownershipType: string;
  hasActivities: boolean;
  hasNotes: boolean;
  isActivity: boolean;
  pluralName: any;
  logicalName: string;
  prefix: string;

  get attrs() {
    return this.attributes.filter(x => x.attributeType.toLowerCase() != 'lookup');
  }
  get lookups() {
    return this.attributes.filter(x => x.attributeType.toLowerCase() == 'lookup');
  }

  constructor(
    schemaName: string,
    displayName: string,
    description: string,
    displayCollectionName: string,
    ownershipType: string = "UserOwned",
    hasActivities: boolean = false,
    hasNotes: boolean = false,
    isActivity: boolean = false
  ) {
    this.schemaName = schemaName;
    this.displayName = displayName;
    this.description = description;
    this.displayCollectionName = displayCollectionName;
    this.ownershipType = ownershipType;
    this.hasActivities = hasActivities;
    this.hasNotes = hasNotes;
    this.isActivity = isActivity;
    this.attributes = [];
    this.metadataId = '';
    this.logicalName = '';
    this.prefix = this.schemaName.substring(0, this.schemaName.indexOf("_") + 1);
  }

  addAttribute(attribute: CrmMetaAttribute) {
    this.attributes.push(attribute);
  }

  sanitizeBeforeCreate() {
    let idField = `${this.schemaName}id`;
    let nameField = `${this.prefix}name`;
    this.attributes = this.attributes.filter((attr) => {
      let schemaName = attr.schemaName.toLowerCase();
      return attr.schemaName && attr.attributeType && schemaName != idField && schemaName.toLowerCase() != nameField;
    });
    this.attributes.forEach((attr) => {
      if (attr.schemaName == idField) {
        attr.isPrimaryName = false;
      }
      if (attr.attributeType == 'String') {
        attr.maxLength = 500;
      }
    });
    let primaryAttr = new CrmMetaAttribute(nameField, "Name", "Name", "String");
    primaryAttr.isPrimaryName = true;
    this.attributes.push(primaryAttr);
  }

  toPayload() {
    return {
      "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
      SchemaName: this.schemaName,
      DisplayName: {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        LocalizedLabels: [
          {
            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
            Label: this.displayName,
            LanguageCode: 1033,
          },
        ],
      },
      Description: {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        LocalizedLabels: [
          {
            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
            Label: this.description,
            LanguageCode: 1033,
          },
        ],
      },
      DisplayCollectionName: {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        LocalizedLabels: [
          {
            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
            Label: this.displayCollectionName,
            LanguageCode: 1033,
          },
        ],
      },
      HasActivities: this.hasActivities,
      HasNotes: this.hasNotes,
      IsActivity: this.isActivity,
      OwnershipType: this.ownershipType,
      Attributes: this.attributes.map((attr) => attr.toPayload()),
    };
  }
}

export class CrmMetaAttribute {
  schemaName: string;
  displayName: string;
  description: string;
  attributeType: string;
  options: string[];
  isPrimaryName: boolean;
  maxLength: number;
  requiredLevel: string;
  entitySchemaName: any;
  targetEntityName: string;

  constructor(
    schemaName: string,
    displayName: string,
    description: string,
    attributeType: string,
    options: string[] = [],
    maxLength: number = 100,
    requiredLevel: string = "None"
  ) {
    this.schemaName = schemaName;
    this.displayName = displayName;
    this.description = description;
    this.attributeType = attributeType;
    this.options = options;
    this.isPrimaryName = false;
    this.maxLength = maxLength;
    this.requiredLevel = requiredLevel;
    this.targetEntityName = '';

  }

  toPayload() {

    switch (this.attributeType.toLowerCase()) {
      case 'number':
      case 'wholenumber':
        this.attributeType = 'Decimal';
        break;
      case 'date':
      case 'datetime':
        this.attributeType = 'DateTime';
        break;
      case 'optionset':
      case 'choice':
      case 'picklist':
        this.attributeType = 'Picklist';
        break;
      case 'money':
      case 'currency':
        this.attributeType = 'Money';
        break;
      case 'string':
        this.attributeType = 'String';
        break;
    }

    let odataType = `Microsoft.Dynamics.CRM.${this.attributeType}AttributeMetadata`;

    let payload: any = {
      "@odata.type": odataType,
      SchemaName: this.schemaName,
      DisplayName: {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        LocalizedLabels: [{ "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", Label: this.displayName, LanguageCode: 1033 }]
      },
      Description: {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        LocalizedLabels: [
          {
            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
            Label: this.description,
            LanguageCode: 1033,
          },
        ],
      },
      RequiredLevel: {
        Value: this.requiredLevel,
        CanBeChanged: true,
        ManagedPropertyLogicalName: "canmodifyrequirementlevelsettings",
      },
      AttributeTypeName: { Value: `${this.attributeType}Type` },
      AttributeType: this.attributeType,
    };

    if (this.attributeType == 'String') {
      payload.IsPrimaryName = this.isPrimaryName;
      payload.MaxLength = this.maxLength;
      payload.FormatName = { Value: "Text" };
    } else if (this.attributeType == 'Memo') {
      payload.MaxLength = this.maxLength;
      payload.FormatName = { Value: "TextArea" };
    } else if (this.attributeType == 'Integer') {
      payload.MinValue = 0;
      payload.MaxValue = 1000000;
    } else if (this.attributeType == 'Money') {
      payload.PrecisionSource = 2;
    } else if (this.attributeType == 'Boolean') {
      payload.OptionSet = {
        "TrueOption": {
          "Value": 1,
          "Label": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [
              {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": "True",
                "LanguageCode": 1033,
                "IsManaged": false
              }
            ]
          }
        },
        "FalseOption": {
          "Value": 0,
          "Label": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [
              {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": "False",
                "LanguageCode": 1033,
                "IsManaged": false
              }
            ]
          }
        },
        "OptionSetType": "Boolean"
      };
    } else if (this.attributeType == 'Picklist') {
      let _options = this.options.map((opt, i) => {
        return {
          "Value": 727000001 + i,
          "Label": {
            "@odata.type": "Microsoft.Dynamics.CRM.Label",
            "LocalizedLabels": [
              {
                "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                "Label": opt,
                "LanguageCode": 1033,
                "IsManaged": false
              }
            ],
            "UserLocalizedLabel": {
              "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
              "Label": opt,
              "LanguageCode": 1033,
              "IsManaged": false
            }
          }
        };
      });
      payload.OptionSet = {
        "@odata.type": "Microsoft.Dynamics.CRM.OptionSetMetadata",
        Options: _options,
        "IsGlobal": false,
        "OptionSetType": "Picklist"
      }
    }
    return payload;
  }
}

export class CrmMetaRelationship {
  payload: string | undefined;
  referencedEntity: string;
  referencingEntity: string;
  displayCollectionName: string;
  lookupDisplayName: string;
  lookupSchemaName: string;
  prefix: string;

  constructor(referencingEntity: string, referencedEntity: string, lookupSchemaName: string, lookupDisplayName: string) {
    this.referencedEntity = referencedEntity;
    this.referencingEntity = referencingEntity;
    this.lookupSchemaName = lookupSchemaName;
    this.lookupDisplayName = lookupDisplayName;

    this.displayCollectionName = lookupDisplayName;
    if(this.referencingEntity.indexOf('_') > -1)
      this.prefix = this.referencingEntity.substring(0, this.referencingEntity.indexOf("_") + 1);
    else if(this.referencedEntity.indexOf('_') > -1)
      this.prefix = this.referencedEntity.substring(0, this.referencedEntity.indexOf("_") + 1);
    else
      this.prefix = 'new_';
    
  }

  get name() {
    let _name = `${this.referencingEntity}_${this.lookupSchemaName}_${this.referencedEntity}`;
    if(this.referencingEntity.indexOf('_') === -1)
      _name = `${this.prefix}${_name}`;
     
      return _name;

  }

  toPayload() {
    this.payload = `
    {  
      "SchemaName": "${this.name}",   
      "@odata.type": "Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata",  
      "AssociatedMenuConfiguration": {  
        "Behavior": "UseCollectionName",  
        "Group": "Details",  
        "Label": {  
          "@odata.type": "Microsoft.Dynamics.CRM.Label",  
          "LocalizedLabels": [ { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "${this.displayCollectionName}", "LanguageCode": 1033 } ],  
          "UserLocalizedLabel": { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "${this.displayCollectionName}", "LanguageCode": 1033 }  
        },  
        "Order": 10000  
      },  
      "CascadeConfiguration": {
        "Assign": "NoCascade",
        "Delete": "RemoveLink",
        "Merge": "Cascade",
        "Reparent": "NoCascade",
        "Share": "NoCascade",
        "Unshare": "NoCascade",
        "RollupView": "NoCascade"
      },  
      "ReferencedAttribute": "${this.referencedEntity}id",  
      "ReferencedEntity": "${this.referencedEntity}",  
      "ReferencingEntity": "${this.referencingEntity}",  
      "Lookup": {  
        "AttributeType": "Lookup",
        "AttributeTypeName": { "Value": "LookupType" },  
        "Description": {  
          "@odata.type": "Microsoft.Dynamics.CRM.Label",  
          "LocalizedLabels": [ { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "The owner of the account",  "LanguageCode": 1033 } ],  
          "UserLocalizedLabel": { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "${this.lookupDisplayName}", "LanguageCode": 1033 }  
        },  
        "DisplayName": {  
          "@odata.type": "Microsoft.Dynamics.CRM.Label",  
          "LocalizedLabels": [ { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel", "Label": "${this.lookupDisplayName}", "LanguageCode": 1033 } ],  
          "UserLocalizedLabel": { "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",  "Label": "${this.lookupDisplayName}", "LanguageCode": 1033 }  
        },  
        "RequiredLevel": {  
        "Value": "ApplicationRequired",  
        "CanBeChanged": true,  
        "ManagedPropertyLogicalName": "canmodifyrequirementlevelsettings"  
        },  
        "SchemaName": "${this.lookupSchemaName}", 
        "@odata.type": "Microsoft.Dynamics.CRM.LookupAttributeMetadata"  
      }  
    }     
    `
    return this.payload;
  }
}

interface CrmLookup {
  Id: string;
  Name: string;

}

export class MetaCache {
  entities: CrmEntityMeta[] = [];
  entityMap: { [key: string]: CrmEntityMeta } = {};
  relationships: CrmMetaRelationship[] = [];
  optionSets: CrmOptionSetMeta[] = [];

  async getMetaInfo(project: Project) {
    let mode = 2;
    if(mode == 1)
      return this.getMetaInfoFromProject(project);
    else
      return this.getMetaInfoFromAllSchema(project);

  }

  async getMetaInfoFromProject(project: Project) {
    let projectSchemas: string[] = ['## here is the data model for ' + project.name + '\n'];

    project.modules.forEach((module) => {
      let entityNames = module.entities.map(x => x.name);
      let moduleEntities = this.entities.filter((entity) => entityNames.indexOf(entity.logicalName) > -1);
      let moduleMetaInfo = moduleEntities.map(x =>  ` - ${x.displayName} (${x.logicalName}): ${x.description}`).join('\n');
      projectSchemas.push(`# module: ${module.name}:`);
      projectSchemas.push(moduleMetaInfo);
      
    });
    projectSchemas.push(`## other entities:`);
    let otherEntityNames = project.entities.filter( x => !x.moduleid).map( x => x.name);
    let otherEntities = this.entities.filter((entity) => otherEntityNames.indexOf(entity.logicalName) > -1);
    let otherMetaInfo = otherEntities.map(x => ` - ${x.displayName} (${x.logicalName}): ${x.description}`);
    projectSchemas = [...projectSchemas, ...otherMetaInfo];

    return projectSchemas.join('\n');
  }

  async getMetaInfoFromAllSchema(project: Project) {
    let projectSchemas: string[] = [
      '## here is the jail management sytem data model'
    ];

    let filteredEntities = this.entities.filter(x => x.logicalName && x.logicalName.startsWith(project.prefix))
    let moduleMetaInfo = filteredEntities.map(x =>  ` - ${x.displayName} (${x.logicalName}): ${x.description}`);
    projectSchemas = [...projectSchemas, ...moduleMetaInfo ];
    return projectSchemas.join('\n');
  }
}

