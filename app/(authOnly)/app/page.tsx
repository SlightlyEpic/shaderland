import ProfileCsr from '@/components/my/profileCsr';

export default function AppPage() {
    return (
        <main className='w-full h-full flex flex-col items-center justify-center gap-4'>
            <div className='font-mono text-2xl'>Hello shaderland</div>
            <ProfileCsr />
        </main>
    );
}
