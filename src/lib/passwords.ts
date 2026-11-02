import bcrypt from 'bcryptjs';
import {createHash} from 'node:crypto';
// Prehash new credentials so bcrypt's 72-byte limit cannot silently truncate Unicode passwords.
// Existing bcrypt hashes remain valid and are never rewritten during sign-in.
const prefix='ip2:';
const prehash=(value:string)=>createHash('sha256').update(value,'utf8').digest('hex');
export async function hashPassword(value:string){return prefix+await bcrypt.hash(prehash(value),12);}
export async function verifyPassword(value:string,stored:string){return stored.startsWith(prefix)?bcrypt.compare(prehash(value),stored.slice(prefix.length)):bcrypt.compare(value,stored);}
