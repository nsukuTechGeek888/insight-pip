import Comparison from '@/components/research/Comparison';
export default async function ComparePage({searchParams}:{searchParams:Promise<{type?:string;ids?:string}>}){const q=await searchParams;const ids=(q.ids||'').split(',').map(Number).filter(n=>Number.isSafeInteger(n)&&n>0).slice(0,3);return <Comparison initialType={q.type} initialIds={ids}/>}
