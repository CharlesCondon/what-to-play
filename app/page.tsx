"use client";

import { useId, useState, FormEvent, useMemo } from "react";
import Image from "next/image";
import Spinner from "@/components/Spinner/Spinner";

interface User {
    id: number;
    name: string;
    avatar: string;
    games: GameMini[];
}

interface GameMini {
    appid: number;
    img_icon_url: string;
    name: string;
}

export default function Home() {
    const steamInputId = useId();
    const compareInputId = useId();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [minCompareValue, setMinCompareValue] = useState<number>(2);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const commonGames = useMemo(() => {
        if (allUsers.length < 2) {
            return [];
        }

        const gameCount = new Map<number, { count: number; game: GameMini }>();

        allUsers.forEach((user) => {
            user.games.forEach((game) => {
                if (gameCount.has(game.appid)) {
                    gameCount.get(game.appid)!.count++;
                } else {
                    gameCount.set(game.appid, { count: 1, game });
                }
            });
        });

        const similar = Array.from(gameCount.values())
            .filter((item) => item.count >= minCompareValue)
            .map((item) => item.game);

        return similar.sort((a, b) => a.name.localeCompare(b.name));
    }, [allUsers, minCompareValue]);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        fetch(`/api/steam?steamid=${formJson.steamID}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setErrorMsg(data.error);
                    return;
                }
                const isDuplicate = allUsers.some(
                    (user) => user.id === data.id
                );
                if (!isDuplicate) {
                    setAllUsers([...allUsers, data]);
                    setErrorMsg("");
                }

                console.log(data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    function handleCompareChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setMinCompareValue(parseInt(e.target.value));
    }

    const dropdownOptions = Array.from(
        { length: allUsers.length - 1 },
        (_, i) => i + 2
    );

    return (
        <div className="flex min-h-screen items-center justify-center font-sans">
            <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-8 py-32 px-16 sm:items-start border-x">
                <div className="flex w-full gap-4">
                    <form
                        method="post"
                        onSubmit={handleSubmit}
                        className="flex flex-1 w-full gap-4"
                    >
                        <label htmlFor={steamInputId} className="sr-only">
                            Steam ID
                        </label>
                        <input
                            id={steamInputId}
                            name="steamID"
                            placeholder="Enter Steam ID"
                            className={`h-full flex-1 border border-solid rounded-md px-4 py-2 ${
                                errorMsg ? "border-red-500" : "border-black"
                            }`}
                        />

                        <button
                            type="submit"
                            className="border rounded-md px-4 py-1"
                        >
                            Submit
                        </button>
                    </form>

                    <div className="flex gap-2 items-center border rounded-md pl-2">
                        <label htmlFor={compareInputId}>
                            Minimum in common
                        </label>
                        <select
                            id={compareInputId}
                            value={minCompareValue}
                            onChange={handleCompareChange}
                            disabled={allUsers.length < 2}
                            className="border-l border-solid border-black  px-4 py-2 disabled:opacity-50"
                        >
                            {dropdownOptions.map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {allUsers.length > 0 && (
                    <ul className="flex flex-wrap gap-4">
                        {allUsers.map((user) => {
                            return (
                                <li
                                    key={user.id}
                                    className="flex gap-2 items-center border rounded pr-4"
                                >
                                    <Image
                                        src={user.avatar}
                                        width={75}
                                        height={75}
                                        alt=""
                                        className="rounded"
                                    />
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-2xl">
                                            {user.name}
                                        </h3>
                                        <p>{user.games?.length} Games</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {commonGames.length > 0 && (
                    <>
                        <div className="w-full">
                            <h2 className="text-2xl font-bold mb-4">
                                Common Games ({commonGames.length})
                            </h2>
                            <ul className="flex flex-wrap gap-2">
                                {commonGames.map((game) => (
                                    <li
                                        key={game.appid}
                                        className="border rounded p-3 flex items-center gap-3"
                                    >
                                        <Image
                                            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                                            width={32}
                                            height={32}
                                            alt=""
                                        />
                                        <span>{game.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => {
                                setShowSpinner(!showSpinner);
                            }}
                            className="border rounded-md px-4 py-1"
                        >
                            {showSpinner ? "Hide Spinner" : "Show Spinner"}
                        </button>
                        {showSpinner && <Spinner games={commonGames} />}
                    </>
                )}
            </main>
        </div>
    );
}
