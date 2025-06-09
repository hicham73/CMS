import { IdName } from "./models/crm.model";

export function id2name(options: IdName[], id: string) {
    return options.find( x => x.id == id)?.name;
}

function ToInt(str: string) {
    if (str == undefined || str == null || str == '' || str == 'default')
        return null;

    return parseInt(str);
}

function ToStr(obj: Object) {
    if (obj != undefined && obj != null)
        return obj + '';

    return '';
}

function ToDate(str: string) {
    var ret = null;
    if (str != undefined && str != null && str != '') {
        var d = new Date(str);
        var y = d.getFullYear();
        var mon = (d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1);
        var day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate();
        var h = d.getHours() < 10 ? '0' + d.getHours() : d.getHours();
        var m = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
        var s = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds();
        return y + '-' + mon + '-' + day + 'T' + h + ':' + m + ':' + s + '.000Z';
    }

    return null;

}
    

export function extractEntityName(fetchXml: string): string | undefined {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fetchXml, 'application/xml');
    const entityNode = doc.querySelector('entity');
    if (!entityNode) {
      return undefined;
    }
    return entityNode.getAttribute('name') || undefined;
}

  

export function IndexOfAny(str: string, vals: string[])
{
    let retVal = -1;
    vals.forEach( x => {
        retVal = str.indexOf(x) > -1 ? 0 : retVal;
    })

    return retVal;
}


export function ApplyParamsToFetch(fetch: string, args: string[])
{
    args.forEach( (x,i) => {
        fetch = fetch.replace(`${i+1}`, args[i]);
    });

    return fetch;
}

export function IsLocalEnv() {
    // console.log('environment: ', environment);
    return true;
    //return document.URL.indexOf('localhost') > -1

}

