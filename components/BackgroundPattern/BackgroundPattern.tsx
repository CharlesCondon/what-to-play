export default function BackgroundPattern() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="fixed inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)`,
                        backgroundSize: "50px 50px",
                        transform: "perspective(500px) rotateX(80deg)",
                        transformOrigin: "center center",
                    }}
                ></div>
            </div>
        </div>
    );
}
