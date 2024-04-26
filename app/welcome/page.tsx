'use client'

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Merge, SquarePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import React from 'react';

// const WelcomePage: React.FC = () => {

// };

export default function WelcomePage() {
    const router = useRouter();
    const handleCreateSession = async () => {

        try{
            const response = await fetch('http://localhost:5050/session', {method:'POST'});
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            router.push(`/session/${data.sessionId}`);
        }
        catch (error) {
            console.error('Error:', error);
        }
        // Logic for creating a new session
    };

    const handleJoinSession = async () => {
        // Logic for joining an existing session
        // verify if valid uuid

        try {
            const response = await fetch('http://localhost:3002/login/participant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ob_json)
            });

            if (!response.ok) {
                console.log(response.body)
                throw new Error('Network response was not ok');
            }

            // dispatch(setUserInfo({username: username, userType: "user", isLoggedIn: true}));
            const data = await response.json();
            dispatch(setUserInfo({ username: username, userType: "user", isLoggedIn: true, sessionId: sessionId }));
            console.log(data); // Handle the response data
            // router.push('/session/new') 
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='container min-h-screen min-w-full justify-center content-center flex'>
            <Card className="w-[350px] h-fit self-center">
                <CardHeader>
                    <CardTitle>Calendar Sync</CardTitle>
                    <CardDescription>Multi-client real-time calendar application. Create a new calendar or join exisiting one</CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="uuid">UUID for existing session</Label>
                                <Input id="uuid" placeholder="XXXX-XXXX-XXXX" />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="
                                    flex 
                                    justify-between
                                    ">
                    <Button className='hover:bg-green-700' onClick={handleCreateSession}>
                        <SquarePlus className='mr-2 ' />Create
                    </Button>
                    <Button className='hover:bg-teal-300' variant="outline">
                        <Merge className='mr-2' />
                        Join
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};