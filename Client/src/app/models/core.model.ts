

export class EntityReference {
    val: string;
    name: string;
    entityName: string;

    get entityPluralName() {
        return this.entityName.endsWith('y') ? this.entityName.substring(0, this.entityName.length - 1) + 'ies' : this.entityName + 's';
    }

    constructor(id: string, name: string, entityName: string) {
        this.val = id;
        this.name = name;
        this.entityName = entityName;
    }
    toString() {
        return this.name;
    }
}

export class Guid {
    val: string | undefined;
}

export class OptionSetValue {
    val: number;
    name: string;

    constructor(id: number, name: string) {
        this.val = id;
        this.name = name;
    }
    toString() {
        return this.name;
    }
}



export class Nothing {
    ServiceProvider: any;
    Service: any;
    TracingService: any;
    Context: any;
    ServiceFactory: any;
}


export class Formula {
    public script: string = ``;
}

interface Col {
    displayName: string;
    schemaName: string;

}

export interface ILog {
    type: string;
    data: any;
    message: string;
}

export interface Project {
    appId: any;
    id: string;
    name: string;
    description: string;
    prefix: string;
    crmHostname: string;
    foHostname: string;
    authUrl: string;
    entities: Entity[];
    modules: Module[];
    siteMapUniqueName: string;
  }
  
  export interface Module {
    id: string;
    project: string; // Foreign key to Module
    name: string;
    description: string;
    page1: string; // Rich text content for module requirements
    page2: string; // Rich text content for module requirements
    page3: string; // Rich text content for module requirements
    page4: string; // Rich text content for module requirements
    page5: string; // Rich text content for module requirements
    entities: Entity[];
  }
  
  export interface Entity {
    id: string;
    projectid: string; // Foreign key to Module
    moduleid: string;
    name: string;
    description: string;
    displayname: string;
    entitytype: number;
  }










