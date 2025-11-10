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
        "#FF6B6B",
        "#4ECDC4",
        "#45B7D1",
        "#FFA07A",
        "#98D8C8",
        "#F7DC6F",
        "#BB8FCE",
        "#85C1E2",
        "#F8B88B",
        "#AAB7B8",
    ];

    const drawWheel = (currentRotation: number) => {
        const canvas = canvasRef.current;
        if (!canvas || games.length === 0) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw and rotate the wheel
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((currentRotation * Math.PI) / 180);

        const sliceAngle = (2 * Math.PI) / games.length;

        games.forEach((game, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();

            // text
            ctx.save();
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.textAlign = "center";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 14px Arial";
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 3;

            const text =
                game.name.length > 20
                    ? game.name.substring(0, 18) + "..."
                    : game.name;
            ctx.fillText(text, radius * 0.65, 5);
            ctx.restore();
        });

        ctx.restore();

        // center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "#333";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // top pointer
        ctx.beginPath();
        ctx.moveTo(centerX, 30);
        ctx.lineTo(centerX - 15, -5);
        ctx.lineTo(centerX + 15, -5);
        ctx.closePath();
        ctx.fillStyle = "#000000";
        ctx.fill();
        ctx.strokeStyle = "#fff";
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
    }, [games, rotation]);

    if (!games || games.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4 p-8 border rounded-lg">
                <p className="text-gray-500">
                    Add at least 2 users to spin the wheel
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 p-8 w-full">
            <h2 className="text-2xl font-bold">Spin to Choose a Game!</h2>

            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="max-w-full"
            />

            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
                {isSpinning ? "Spinning..." : "SPIN!"}
            </button>

            {selectedGame && !isSpinning && (
                <div className="flex items-center gap-4 p-4 bg-green-100 rounded-lg border-2 border-green-500">
                    <div className="text-center">
                        <p className="text-xl font-bold">{selectedGame.name}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
