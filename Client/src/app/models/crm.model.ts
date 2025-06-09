import { Guid } from "../Guid";
import { EntityReference, OptionSetValue } from "./core.model";


export class CRMReferenceValue {
  constructor(
    public AttributeName: string,
    public AttributeValue: string,
    public TargetEntity: string
  ) { }
}

export class CRMOptionSetValue {
  constructor(
    public AttributeName: string,
    public AttributeValue: string,
    public LabelValue: string = ''
  ) { }
}

export interface IdName {
  id: string;
  name: string;
}

export interface CrmSolution {
  solutionid: string;
  friendlyname: string;
  version: string;
  uniquename: string;
}

export interface CrmSolutionComponent {
  solutioncomponentid: string;
  componenttype: number;
  objectid: string;
  displayname: string;
  componenttypename?: string;
}

export interface FormLayout {
  sections: FormSection[];
  tabs: FormTab[];
}

export interface FormSection {
  name: string;
  id: string;
  visible: boolean;
  showLabel: boolean;
  label: string;
  columns: FormColumn[];
}

export interface FormColumn {
  width: number;
  controls: FormControl[];
}

export interface FormControl {
  id: string;
  controlType: string;
  name: string;
  label: string;
  visible: boolean;
  disabled: boolean;
  required: boolean;
  dataType: string;
}

export interface FormTab {
  id: string;
  name: string;
  label: string;
  visible: boolean;
  sections: FormSection[];
}

export interface CrmForm {
  record: Record;
  formid: string;
  objecttypecode: string;
  formuniqueid: string;
  ismanaged: boolean;
  name: string;
  description: string;
  type: number;
  solutionid: string;
  isdefault: boolean;
  formxml: string;

  formLayout: FormLayout;
}

export interface CrmView {
  savedqueryid: string;
  name: string;
  type: number;
  iscustom: boolean;
  fetchxml: string;
  layoutxml: string;
  description: string,
  returnedtypecode: string; // entity logical name
  querytype: 0; // 0 for main grid views
  isdefault: boolean;
  isquickfindquery: boolean;
  queryapi: boolean;
  isuserdefined: boolean;
}

export class CrmFetch {
  m_id: string = '';
  m__id = Guid.create();
  m_name = '';
  m_xml = '';
  m_formulaId = '';

  isNew = true;
  isDirty = false;

  constructor(i: any = null) {
    if (i) this.fill(i)
  }

  fill(i: any) {
    this.m_id = i.pf_fetchid;
    this.m__id = i.pf_fetchid;
    this.m_name = i.pf_name;
    this.m_xml = i.pf_xml;
    this.m_formulaId = i._pf_formula_value;
    this.isNew = false;
  }

  set id(v) {
    if (this.m_id == v) return;
    this.m_id = v;
    this.isDirty = true;
  }
  get id() { return this.m_id; }

  set formulaId(v) {
    if (this.m_formulaId == v) return;
    this.m_formulaId = v;
    this.isDirty = true;
  }
  get formulaId() { return this.m_formulaId; }

  set _id(v) {
    if (this.m__id == v) return;
    this.m__id = v;
    this.isDirty = true;
  }
  get _id() { return this.m__id; }

  set name(v) {
    if (this.m_name == v) return;
    this.m_name = v;
    this.isDirty = true;
  }
  get name() { return this.m_name; }

  set xml(v) {
    if (this.m_xml == v) return;
    this.m_xml = v;
    this.isDirty = true;
  }
  get xml() { return this.m_xml; }

}


export class CrmAgent {
  id: string = '';
  name = '';
  description = '';
  model = 0;
  instructions = '';
  apiKey = '';
  endpoint = '';
  maxIterations = 1;

  isNew: boolean = true;
  isDirty: boolean = false;

  constructor(i: any = null) {
    if (!i) {
      this.id = Guid.create().toString();
      this.isNew = true;
      return;
    }

    this.fill(i)
  }

  fill(i: any) {
    this.isNew = false;
    this.id = i.pf_agentid;
    this.name = i.pf_name;
    this.description = i.pf_description;
    this.model = i.pf_model;
    this.instructions = i.pf_instructions;
    this.apiKey = i.pf_apikey;
    this.endpoint = i.pf_endpoint;
    this.maxIterations = i.pf_maxiterations;

  }

  toCrmData() {
    return {
      pf_agentid: this.id,
      pf_name: this.name,
      pf_description: this.description,
      pf_model: this.model,
      pf_instructions: this.instructions,
      pf_apikey: this.apiKey,
      pf_endpoint: this.endpoint,
      pf_maxiterations: this.maxIterations
    }
  }

}

export interface CrmEntityMeta {
  metadataId: string;
  schemaName: string;
  logicalName: string;
  description: string;
  displayName: string;
  attributes: CrmAttributeMeta[];
  optionSets: CrmOptionSetMeta[];
  attributeMap: { [key: string]: CrmAttributeMeta };
  optionSetMap: { [key: string]: CrmOptionSetMeta };
  isCustom: boolean;
  selected: boolean;
  objectTypeCode: number;
  PrimaryIdAttribute: string;
  PrimaryNameAttribute: string;
}

export interface CrmAttributeMeta {
  schemaName: string;
  logicalName: string;
  displayName: string;
  isCustom: boolean;
  attributeType: string;
  target?: string; // for Lookup attributes
}

export interface OptionMetadata {
  Value: number;
  Label: string;
}

export interface CrmOptionSetMeta {
  LogicalName: string;
  DisplayName: string;
  Options: OptionMetadata[];
  Id2Name: { [key: number]: string };
  Name2Id: { [key: string]: number };
}

export class CrmAttribute {
  name: string;
  val: any;
  schemaName: any;
  required: any;
  displayName: any;
  type: any;

  constructor(name: string, val: any) {
    this.name = name;
    this.val = val;
  }

  toString() {
    return this.val;
  }
}

export class CrmString {
  val: string;
  constructor(val: string) {
    this.val = val;
  }

  toString() {
    return this.val;
  }
}

export class CrmNumber {
  val: number;
  constructor(val: number) {
    this.val = val;
  }

  toString() {
    return this.val;
  }
}

export class CrmEntity {
  LogicalName: string;
  private _cols = new Set<string>();
  Id: string = '';
  Attributes: { [key: string]: any } = {};
  ModifiedAttributes: { [key: string]: any } = {};
  DisplayName: any;

  constructor(LogicalName: string) {
    this.LogicalName = LogicalName;
  }

  get Cols() {
    if (this._cols.size == 0) {
      let attrs = Object.keys(this.Attributes).length > 0 ? this.Attributes : this.ModifiedAttributes;
      for (let key in attrs) {
        this._cols.add(key);
      }
    }
    return this._cols;
  }

  get pluralName() {
    let pluralName = '';
    if(this.LogicalName.endsWith('y'))
      pluralName = this.LogicalName.substring(0, this.LogicalName.length - 1) + 'ies';
    else if(this.LogicalName.endsWith('s'))
      pluralName = this.LogicalName + 'es';
    else
      pluralName = this.LogicalName + 's';

    return pluralName;
  }

  fill = async (attributes: { [key: string]: any }, entityMeta: CrmEntityMeta): Promise<Set<string>> => {
    if(!attributes) return new Set<string>();
    let attrNames = new Set<string>();
    // todo: generalize this
    this.Id = attributes[entityMeta.logicalName + "id"];
    for (let key in attributes) {
      if (key == '@data.etag')
        continue;
      let _key = '';
      let isLookup = false;
      let isFormattedValue = false;
      let idx1 = key.indexOf('_');
      let idx2 = key.indexOf('@OData.Community.Display.V1.FormattedValue');

      if (idx2 > 0)
        isFormattedValue = true;

      if (idx1 == 0) {

        isLookup = true;
        if (idx2 > 0) {
          _key = key.substring(1, idx2);
        } else {
          _key = key.substring(1);
        }
        if (_key.endsWith('_value'))
          _key = _key.substring(0, _key.length - 6);
      } else {
        if (idx2 > 0)
          _key = key.substring(0, idx2);
        else
          _key = key;
      }


      this._cols.add(_key);
      let attrMeta = entityMeta?.attributes.find(x => x.logicalName == _key);
      let attrType = attrMeta?.attributeType;
      if (attrType == 'String' || attrType == 'uniqueidentifier' || attrType == 'Memo') {
        this.Attributes[_key] = new CrmString(attributes[key]);
      }
      if (attrType == 'Integer') {
        this.Attributes[_key] = new CrmNumber(attributes[key]);
      }
      else if (attrType == 'DateTime') {
        this.Attributes[_key] = new CrmDate(attributes[key]);
      } else if (attrType == 'Lookup') {
        let attr: EntityReference = this.Attributes[_key];
        if (!attr) {
          attr = new EntityReference('', '', this.LogicalName);
          this.Attributes[_key] = attr;
        }

        if (isFormattedValue)
          attr.name = attributes[key] as string;
        else
          attr.val = attributes[key] as string

      } else if (attrType == 'Picklist' || attrType == 'State' || attrType == 'Status') {
        let attr: OptionSetValue = this.Attributes[_key];
        if (!attr) {
          attr = new OptionSetValue(-1, '');
          this.Attributes[_key] = attr;
        }
        if (isFormattedValue)
          attr.name = attributes[key] as string;
        else
          attr.val = attributes[key] as number;

      }

      // Ensure the attribute is properly set
      if (!this.Attributes[key] && !isFormattedValue && !isLookup) {
        this.Attributes[key] = attributes[key];
      }
    }

    return attrNames;
  }


  public getModifiedData() {
    let data: { [key: string]: any } = {};

    for (const key in this.ModifiedAttributes) {
      let val = this.ModifiedAttributes[key].val;
      if (val instanceof EntityReference) {
        data[`${key}@odata.bind`] = `/${val.entityPluralName}(${val.val})`;
      }
      else if (val instanceof OptionSetValue) {
        data[key] = val.val;
      } else if (val instanceof CrmNumber) {
        data[key] = val.val;
      } else if (val instanceof CrmDate) {
        data[key] = val.val;
      } else if (val instanceof CrmString) {
        data[key] = val.val;
      } else {
        data[key] = val;
      }
    }

    return data;

  }
}

export class CrmDate {
  val: Date | null;
  constructor(val: string) {
    this.val = val == null ? null : new Date(val);
  }

  toString() {
    return this.val?.toDateString();
  }
}


export class ODataResult {

  constructor(res: any) {
      this["@odata.context"] = res["@odata.context"];
      this.value = res.value;
  }


  "@odata.context": string;
   value: { [key: string]: string }[];
   logicalName: string = '';

  toEntities(entityMeta: CrmEntityMeta): CrmEntity[] {
      let entities: CrmEntity[] = [];
      for (let i = 0; i < this.value.length; i++) {
          let entityResult = this.value[i];
          let entity = this.convertToEntity(entityMeta, entityResult);
          entities.push(entity);
      }
      return entities;
  }

  convertToEntity(entityMeta: CrmEntityMeta, result: { [key: string]: string }): CrmEntity {
      let entity = new CrmEntity(entityMeta.logicalName);
      entity.fill(result as { [key: string]: string }, entityMeta as CrmEntityMeta);
      return entity;
  }

  
}

export interface Record {
  entity: CrmEntity;
  map: Map<string, Object>;
}

export class Records {
    index = -1;
    entityName: string = '';
    cols = new Set<string>();
    data: Record[] = [];

    constructor(index: number, entities: CrmEntity[]) {
        this.index = index;
        entities.forEach((entity) => {
            this.entityName = entity.LogicalName;
            let _rec = { entity: entity, map: new Map<string, Object>() };
            entity.Cols.forEach(key => {
                if (key == '@odata.etag')
                    return;
                this.cols.add(key);
                let val = entity.Attributes[key];
                if (val != undefined)
                    _rec.map.set(key, val.toString());

            });
            this.data.push(_rec);
        });
    }

    get columns() {
        return Array.from(this.cols);
    }
}


