'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex h-screen flex-col items-center justify-center bg-stone-900 text-white">
                    <h2 className="mb-4 text-2xl font-bold">Something went completely wrong!</h2>
                    <button
                        onClick={() => reset()}
                        className="rounded bg-stone-700 px-4 py-2 hover:bg-stone-600"
                    >
                        Try again to reload
                    </button>
                </div>
            </body>
        </html>
    );
}
