export default function BackgroundPattern() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Static grid */}
            <div className="fixed inset-0 opacity-20 ">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                    }}
                />
            </div>

            {/* Gentle pulsing orbs - much cheaper than hue-rotate */}
            <div
                className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDuration: "4s" }}
            />
            <div
                className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"
                style={{ animationDuration: "5s", animationDelay: "1s" }}
            />
        </div>
    );
}
