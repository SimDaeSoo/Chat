import { Dictionary } from '../interfaces';

export function cookieStringToObject(cookie: string): Dictionary<string> {
    return cookie.split(';').reduce((res: Dictionary<string>, c: string): Dictionary<string> => {
        const [key, val]: [string, string] = c.trim().split('=').map(decodeURIComponent) as [string, string];
        try {
            return Object.assign(res, { [key]: JSON.parse(val) });
        } catch (e) {
            return Object.assign(res, { [key]: val });
        }
    }, {});
}