import WriteExperience from '@/components/research/WriteExperience';
export default async function WritePage({searchParams}:{searchParams:Promise<{kind?:string}>}){const q=await searchParams;return <WriteExperience incident={q.kind==='incident'}/>}
