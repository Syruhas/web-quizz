"use client";
import { useState } from 'react';
import { GroupList } from '@/components/group-list';

export default function GroupPage() {
    const [refreshFlag, setRefreshFlag] = useState(false);

    return (
            <div className='align-content'>
            <GroupList key={refreshFlag ? "1" : "0"}/>
            </div>  
    );
}