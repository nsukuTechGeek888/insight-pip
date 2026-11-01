"use client";
import {ReactNode} from 'react';
export default function MobileLayout({children,title}:{children:ReactNode;title:string;showSearch?:boolean;showBack?:boolean}){return <section aria-label={title} className="v2-legacy-mobile">{children}</section>}
