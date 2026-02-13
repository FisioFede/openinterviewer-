'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-stone-900 text-white">
            <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
            <button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                className="rounded bg-stone-700 px-4 py-2 hover:bg-stone-600"
            >
                Try again
            </button>
        </div>
    );
}
