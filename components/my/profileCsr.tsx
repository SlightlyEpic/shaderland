'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import LoginButton from './loginButton';
import { Card, CardContent } from '../ui/card';

export default function ProfileCsr() {
    const { user, error, isLoading } = useUser();

    if(user) {
        return (
            <Card>
                <CardContent className='flex gap-2 items-center rounded-md border p-2'>
                        <div className=''>
                            {user.nickname}
                        </div>
                        <Avatar>
                            <AvatarImage src={user.picture!} className='rounded-full w-10 aspect-square' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                </CardContent>
            </Card>
        )
    }

    return <LoginButton />
}
