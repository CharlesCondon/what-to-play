import { useRef, useEffect, useState } from "react";

interface GameMini {
    appid: number;
    img_icon_url: string;
    name: string;
}

interface WheelProps {
    games: GameMini[];
}

export default function Spinner({ games = [] }: WheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedGame, setSelectedGame] = useState<GameMini | null>(null);

    const colors = [
        "#8B5CF6", // purple-500
        "#EC4899", // pink-500
        "#6366F1", // indigo-500
        "#A855F7", // purple-500
        "#D946EF", // fuchsia-500
        "#7C3AED", // violet-600
        "#DB2777", // pink-600
        "#9333EA", // purple-600
        "#C026D3", // fuchsia-600
        "#8B5CF6", // purple-500
    ];

    function adjustBrightness(hex: string, percent: number): string {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = ((num >> 8) & 0x00ff) + amt;
        const B = (num & 0x0000ff) + amt;
        return (
            "#" +
            (
                0x1000000 +
                (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
                (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
                (B < 255 ? (B < 1 ? 0 : B) : 255)
            )
                .toString(16)
                .slice(1)
        );
    }

    const drawWheel = (currentRotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas || games.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw outer glow
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(0, 0, radius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
        ctx.lineWidth = 10;
        ctx.stroke();
        ctx.restore();

        // Draw and rotate the wheel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((currentRotation * Math.PI) / 180);

        const sliceAngle = (2 * Math.PI) / games.length;

        games.forEach((game, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Draw slice with gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
            gradient.addColorStop(0, colors[index % colors.length]);
            gradient.addColorStop(
                1,
                adjustBrightness(colors[index % colors.length], -20)
            );

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Stroke with slight glow
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFFFFF";
            ctx.font =
                "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 4;

            const text =
                game.name.length > 18
                    ? game.name.substring(0, 16) + "..."
                    : game.name;
            ctx.fillText(text, radius * 0.65, 5);
            ctx.restore();
        });

        ctx.restore();

        // Draw center circle with gradient
        const centerGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            30
        );
        centerGradient.addColorStop(0, "#6B21A8");
        centerGradient.addColorStop(1, "#4C1D95");

        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = centerGradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Add center glow
        ctx.shadowColor = "rgba(139, 92, 246, 0.6)";
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(139, 92, 246, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pointer at top with glow
        ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(centerX, 40);
        ctx.lineTo(centerX - 20, 10);
        ctx.lineTo(centerX + 20, 10);
        ctx.closePath();

        const pointerGradient = ctx.createLinearGradient(
            centerX,
            10,
            centerX,
            40
        );
        pointerGradient.addColorStop(0, "#EF4444");
        pointerGradient.addColorStop(1, "#DC2626");
        ctx.fillStyle = pointerGradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const spinWheel = () => {
        if (isSpinning || games.length === 0) return;

        setIsSpinning(true);
        setSelectedGame(null);

        const spinDuration = 2000;
        const minRotations = 5;
        const maxRotations = 8;
        const totalRotations =
            minRotations + Math.random() * (maxRotations - minRotations);
        const totalDegrees = totalRotations * 360;

        const randomOffset = Math.random() * 360;
        const finalRotation = totalDegrees + randomOffset;

        const startTime = Date.now();
        const startRotation = rotation;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / spinDuration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + finalRotation * easeOut;

            setRotation(currentRotation % 360);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);

                const finalAngle = currentRotation % 360;
                const sliceAngle = 360 / games.length;

                const pointerPosition = 270;
                const sliceAtPointer =
                    (pointerPosition - finalAngle + 360) % 360;
                const selectedIndex =
                    Math.floor(sliceAtPointer / sliceAngle) % games.length;

                setSelectedGame(games[selectedIndex]);
            }
        };

        requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (games && games.length > 0) {
            drawWheel(rotation);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [games, rotation]);

    return (
        <div className="flex flex-col items-center gap-8 p-8 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl w-full shadow-2xl">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    width={500}
                    height={500}
                    className="max-w-full drop-shadow-2xl"
                />
                {isSpinning && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-ping"></div>
                    </div>
                )}
            </div>

            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="px-10 py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:hover:scale-100"
            >
                {isSpinning ? (
                    <span className="flex items-center gap-3">
                        <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Spinning...
                    </span>
                ) : (
                    "SPIN THE WHEEL"
                )}
            </button>

            {selectedGame && !isSpinning && (
                <div className="w-full max-w-md backdrop-blur-xl bg-linear-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-2xl p-6 shadow-2xl shadow-green-500/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-white">
                            {selectedGame.name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
