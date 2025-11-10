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
    categories: Category[];
}

interface Category {
    id: number;
    description: string;
}

export default function Home() {
    const steamInputId = useId();
    const compareInputId = useId();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [minCompareValue, setMinCompareValue] = useState<number>(2);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [hiddenGameIds, setHiddenGameIds] = useState<Set<number>>(new Set());
    const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
        new Set()
    );
    const [showCategoryFilter, setShowCategoryFilter] =
        useState<boolean>(false);

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

    const allCategories = useMemo(() => {
        const categoryMap = new Map<number, string>();

        commonGames.forEach((game) => {
            game.categories?.forEach((category) => {
                if (!categoryMap.has(category.id)) {
                    categoryMap.set(category.id, category.description);
                }
            });
        });

        return Array.from(categoryMap.entries())
            .map(([id, description]) => ({ id, description }))
            .sort((a, b) => a.description.localeCompare(b.description));
    }, [commonGames]);

    const visibleGames = useMemo(() => {
        let filtered = commonGames.filter(
            (game) => !hiddenGameIds.has(game.appid)
        );

        if (selectedCategories.size > 0) {
            filtered = filtered.filter((game) =>
                game.categories?.some((cat) => selectedCategories.has(cat.id))
            );
        }

        return filtered;
    }, [commonGames, hiddenGameIds, selectedCategories]);

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
            })
            .catch((error) => {
                console.log(error);
            });
    }

    function handleCompareChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setMinCompareValue(parseInt(e.target.value));
    }

    function hideGame(appid: number) {
        setHiddenGameIds(new Set(hiddenGameIds).add(appid));
    }

    function resetHiddenGames() {
        setHiddenGameIds(new Set());
    }

    function toggleCategory(categoryId: number) {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(categoryId)) {
            newSelected.delete(categoryId);
        } else {
            newSelected.add(categoryId);
        }
        setSelectedCategories(newSelected);
    }

    function clearCategoryFilters() {
        setSelectedCategories(new Set());
    }

    function removeUser(userid: number) {
        const filteredUsers = allUsers.filter((user) => user.id !== userid);
        setAllUsers(filteredUsers);
    }

    const dropdownOptions = Array.from(
        { length: allUsers.length - 1 },
        (_, i) => i + 2
    );

    return (
        <div className="flex flex-col min-h-screen items-center justify-center font-sans">
            <header className="max-w-5xl p-8">
                <h1 className="text-4xl font-bold ">What Should We Play?</h1>
            </header>
            <main className="flex min-h-screen w-full max-w-5xl flex-col items-center gap-8 px-16 sm:items-start">
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
                            className={`h-full flex-1 border border-solid rounded-md px-4 py-2 bg-white/30 ${
                                errorMsg ? "border-red-500" : "border-black"
                            }`}
                        />

                        <button
                            type="submit"
                            className="border rounded-md px-4 py-1 cursor-pointer bg-white/30 hover:bg-gray-100"
                        >
                            Submit
                        </button>
                    </form>

                    <div className="flex gap-2 items-center border rounded-md pl-2 bg-white/30">
                        <label htmlFor={compareInputId}>
                            Minimum in common
                        </label>
                        <select
                            id={compareInputId}
                            value={minCompareValue}
                            onChange={handleCompareChange}
                            disabled={allUsers.length < 2}
                            className="border-l border-solid border-black  px-4 py-2 disabled:opacity-50 cursor-pointer hover:bg-gray-100 rounded-r-md"
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
                                    className="flex items-center border rounded bg-white/30 relative"
                                >
                                    <Image
                                        src={user.avatar}
                                        width={75}
                                        height={75}
                                        alt=""
                                        className="rounded-r-none rounded-l"
                                    />
                                    <div className="flex flex-col pl-4 pr-6">
                                        <h3 className="font-semibold text-2xl">
                                            {user.name}
                                        </h3>
                                        <p>{user.games?.length} Games</p>
                                    </div>
                                    <button
                                        onClick={() => removeUser(user.id)}
                                        className="text-black hover:text-red-500 font-bold cursor-pointer text-xs absolute top-0 right-1"
                                        aria-label="Hide game"
                                    >
                                        ✕
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {commonGames.length > 0 && (
                    <>
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    Shared Games ({visibleGames.length})
                                </h2>
                                <div className="flex gap-2">
                                    {allCategories.length > 0 && (
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setShowCategoryFilter(
                                                        !showCategoryFilter
                                                    )
                                                }
                                                className="border rounded-md px-4 py-1 text-sm bg-white/30 hover:bg-gray-100"
                                            >
                                                Filter by Category{" "}
                                                {selectedCategories.size > 0 &&
                                                    `(${selectedCategories.size})`}
                                            </button>
                                            {showCategoryFilter && (
                                                <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-white border rounded-md shadow-lg z-10">
                                                    <div className="p-2 border-b flex justify-between items-center">
                                                        <span className="font-bold text-sm">
                                                            Categories
                                                        </span>
                                                        {selectedCategories.size >
                                                            0 && (
                                                            <button
                                                                onClick={
                                                                    clearCategoryFilters
                                                                }
                                                                className="text-xs text-blue-800 hover:underline"
                                                            >
                                                                Clear all
                                                            </button>
                                                        )}
                                                    </div>
                                                    {allCategories.map(
                                                        (category) => (
                                                            <label
                                                                key={
                                                                    category.id
                                                                }
                                                                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCategories.has(
                                                                        category.id
                                                                    )}
                                                                    onChange={() =>
                                                                        toggleCategory(
                                                                            category.id
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                />
                                                                <span className="text-sm">
                                                                    {
                                                                        category.description
                                                                    }
                                                                </span>
                                                            </label>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {hiddenGameIds.size > 0 && (
                                        <button
                                            onClick={resetHiddenGames}
                                            className="border rounded-md px-4 py-1 text-sm bg-white/30 hover:bg-gray-100"
                                        >
                                            Reset ({hiddenGameIds.size} hidden)
                                        </button>
                                    )}
                                </div>
                            </div>
                            <ul className="flex flex-wrap gap-2">
                                {visibleGames.map((game) => (
                                    <li
                                        key={game.appid}
                                        className="border rounded flex items-center gap-3 relative pr-2 bg-white/30"
                                    >
                                        <Image
                                            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                                            width={32}
                                            height={32}
                                            alt=""
                                            className="rounded-r-none rounded-l"
                                        />
                                        <span className="font-semibold">
                                            {game.name}
                                        </span>
                                        <button
                                            onClick={() => hideGame(game.appid)}
                                            className="text-black hover:text-red-500 font-bold cursor-pointer text-xs"
                                            aria-label="Hide game"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button
                            onClick={() => {
                                setShowSpinner(!showSpinner);
                            }}
                            className="border rounded-md px-4 py-1 cursor-pointer hover:bg-gray-100 bg-white/30"
                        >
                            {showSpinner ? "Hide Spinner" : "Show Spinner"}
                        </button>
                        {showSpinner && <Spinner games={visibleGames} />}
                    </>
                )}
            </main>
        </div>
    );
}
