import ReviewDetail from '@/components/research/ReviewDetail';import {prisma} from '@/lib/db';
export async function generateMetadata({params}:{params:Promise<{id:string}>}){try{const r=await prisma.review.findFirst({where:{id:(await params).id,status:'APPROVED',isHidden:false},select:{title:true}});return {title:r?r.title:'Trader review'};}catch{return {title:'Trader review'};}}
export default async function Page({params}:{params:Promise<{id:string}>}){return <ReviewDetail id={(await params).id}/>;}
