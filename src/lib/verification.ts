import {prisma} from './db';
// Legacy flags alone cannot establish the provenance of an independent check.
export async function verifiedIds(type:'review'|'incident',ids?:string[]){if(ids&&!ids.length)return new Set<string>();const events=await prisma.auditEvent.findMany({where:{entityType:type,...(ids?{entityId:{in:ids}}:{}),action:type==='review'?'VERIFY_EXPERIENCE':'INCIDENT_VERIFY'},select:{entityId:true},distinct:['entityId']});return new Set(events.map(e=>e.entityId));}
