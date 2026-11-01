import {NextRequest,NextResponse} from 'next/server';
import {GET as providers} from '@/app/api/research/providers/route';
export async function GET(request:NextRequest){const url=new URL(request.url);url.searchParams.set('search',url.searchParams.get('q')||url.searchParams.get('search')||'');return providers(new NextRequest(url,request))}
