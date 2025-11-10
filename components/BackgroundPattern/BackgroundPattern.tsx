export default function BackgroundPattern() {
    return (
        <div className="fixed inset-0 -z-10 bg-linear-to-br from-blue-900 via-purple-900 to-pink-900 opacity-50">
            <svg className="absolute inset-0 w-full h-full opacity-10">
                <defs>
                    <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle cx="20" cy="20" r="1" fill="white" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
}
