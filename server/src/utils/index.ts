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

export function randomSeed(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result: string = '';
    for (let i = 0; i < length; i++) {
        const index: number = Math.round(Math.random() * (characters.length - 1))
        result += characters[index];
    }
    return result;
}