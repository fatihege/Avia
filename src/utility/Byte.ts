import { Bytes } from '../Constants';

export default (byte: number): string => {
    const exp: number = Math.floor(Math.log(byte) / Math.log(1024));
    return `${(byte / Math.pow(1024, Math.floor(exp))).toFixed(2)} ${Bytes[exp]}`;
}