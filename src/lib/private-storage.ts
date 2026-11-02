import path from 'node:path';
export function privateDirectory(kind:'evidence'|'mail'){const root=path.resolve(process.env.PRIVATE_STORAGE_DIR||'.private');const publicRoot=path.resolve('public');if(root===publicRoot||root.startsWith(publicRoot+path.sep))throw Error('Private storage must be outside the public directory');return path.join(root,kind);}
