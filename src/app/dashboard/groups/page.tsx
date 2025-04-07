"use client";
import { useState } from 'react';
import { GroupForm } from '@/components/group-form';
import { GroupList } from '@/components/group-list';
import { SessionProvider } from 'next-auth/react';

export default function GroupPage() {
    const [refreshFlag, setRefreshFlag] = useState(false);

    return (
        <SessionProvider>
        <div className="flex min-h-screen items-center justify-center">
            
            <GroupList key={refreshFlag ? "1" : "0"}/>
        </div>
        </SessionProvider>
    );
}