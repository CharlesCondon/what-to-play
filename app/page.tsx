"use client";

import { useId, useState, FormEvent, useMemo, SetStateAction } from "react";
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
    const [idInput, setIdInput] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
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
        if (allUsers.length < 1) {
            return [];
        }

        if (allUsers.length === 1) {
            return allUsers[0].games.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
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
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        const isDuplicate = allUsers.some(
            (user) => user.id.toString() === formJson.steamID
        );

        if (isDuplicate) {
            setIsLoading(false);
            return;
        }

        fetch(`/api/steam?steamid=${formJson.steamID}`)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    setErrorMsg(data.error);
                    setIsLoading(false);
                    return;
                }

                setAllUsers([...allUsers, data]);
                setMinCompareValue(allUsers.length + 1);
                setErrorMsg("");
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

        setIdInput("");
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
        setMinCompareValue(allUsers.length - 1);
    }

    const dropdownOptions = Array.from(
        { length: allUsers.length },
        (_, i) => i + 1
    );

    const handleInputChange = (e: {
        target: { value: SetStateAction<string> };
    }) => {
        setIdInput(e.target.value);
    };

    return (
        <div className="flex flex-col min-h-screen items-center font-sans ">
            {/* Hero Header */}
            <header className="w-full max-w-5xl px-4 sm:px-8 pt-12 pb-8">
                <div className="text-center space-y-2">
                    <h1 className="text-5xl sm:text-6xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        What Should We Play?
                    </h1>
                </div>
            </header>

            <main className="flex w-full max-w-5xl flex-col items-center gap-8 px-4 sm:px-8 pb-16">
                {/* Search Bar */}
                <div className="flex flex-wrap w-full gap-3 justify-center backdrop-blur-xl bg-white/10 p-3 sm:p-6 rounded-2xl shadow-2xl border border-white/20">
                    <form
                        method="post"
                        onSubmit={handleSubmit}
                        className="flex flex-1 w-full gap-3"
                    >
                        <label htmlFor={steamInputId} className="sr-only">
                            Steam ID
                        </label>
                        <input
                            id={steamInputId}
                            name="steamID"
                            placeholder="Enter Steam ID..."
                            className={`h-full flex-1 rounded-xl px-2 sm:px-5 py-3 bg-white/90 backdrop-blur-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-lg ${
                                errorMsg ? "ring-2 ring-red-400" : ""
                            }`}
                            value={idInput}
                            onChange={handleInputChange}
                        />

                        <button
                            type="submit"
                            className="rounded-xl px-3 sm:px-6 py-3 cursor-pointer disabled:cursor-not-allowed bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:hover:from-purple-500 disabled:hover:to-pink-500 transition-all text-white font-semibold shadow-lg hover:shadow-purple-500/50"
                            disabled={isLoading}
                        >
                            Add User
                        </button>
                    </form>

                    <div className="flex gap-2 items-center rounded-xl backdrop-blur-sm bg-white/90 px-4 shadow-lg">
                        <label
                            htmlFor={compareInputId}
                            className="text-slate-700 font-medium text-sm whitespace-nowrap"
                        >
                            Min. Shared
                        </label>
                        <select
                            id={compareInputId}
                            value={minCompareValue}
                            onChange={handleCompareChange}
                            disabled={allUsers.length < 2}
                            className="border-l border-slate-300 pl-3 py-3 disabled:opacity-50 cursor-pointer hover:bg-slate-50 bg-transparent focus:outline-none text-slate-900 font-semibold"
                        >
                            {dropdownOptions.map((num) => (
                                <option key={num} value={num}>
                                    {num}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Users Grid */}
                {allUsers.length > 0 && (
                    <div className="w-full">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-linear-to-b from-purple-400 to-pink-400 rounded-full"></span>
                            Players ({allUsers.length})
                        </h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allUsers.map((user) => {
                                return (
                                    <li
                                        key={user.id}
                                        className="group flex items-center backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 relative"
                                    >
                                        <Image
                                            src={user.avatar}
                                            width={75}
                                            height={75}
                                            alt=""
                                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                                        />
                                        <div className="flex flex-col px-4 py-3 flex-1">
                                            <h3 className="font-bold text-white text-base sm:text-lg">
                                                {user.name}
                                            </h3>
                                            <p className="text-slate-300 text-xs sm:text-sm">
                                                {user.games?.length} Games
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeUser(user.id)}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500 text-white sm:opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-bold"
                                            aria-label="Remove user"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Shared Games Section */}
                {commonGames.length > 0 && (
                    <div className="w-full space-y-6">
                        <div className="backdrop-blur-xl bg-white/10 p-6 rounded-2xl border border-white/20">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-linear-to-b from-purple-400 to-pink-400 rounded-full"></span>
                                    {allUsers.length > 1 ? "Shared" : "All"}{" "}
                                    Games
                                    <span className="text-lg font-normal text-slate-300">
                                        ({visibleGames.length})
                                    </span>
                                </h2>
                                <div className="flex gap-2">
                                    {hiddenGameIds.size > 0 && (
                                        <button
                                            onClick={resetHiddenGames}
                                            className="rounded-lg px-4 py-2 text-sm backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all"
                                        >
                                            Reset ({hiddenGameIds.size})
                                        </button>
                                    )}
                                    {allCategories.length > 0 && (
                                        <div className="relative">
                                            <button
                                                onClick={() =>
                                                    setShowCategoryFilter(
                                                        !showCategoryFilter
                                                    )
                                                }
                                                className="rounded-lg px-4 py-2 text-sm backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all flex items-center gap-2"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                                    />
                                                </svg>
                                                Filter
                                                {selectedCategories.size > 0 &&
                                                    ` (${selectedCategories.size})`}
                                            </button>
                                            {showCategoryFilter && (
                                                <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-y-auto backdrop-blur-xl bg-slate-900/95 border border-white/20 rounded-xl shadow-2xl z-10">
                                                    <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-xl">
                                                        <span className="font-bold text-white">
                                                            Categories
                                                        </span>
                                                        {selectedCategories.size >
                                                            0 && (
                                                            <button
                                                                onClick={
                                                                    clearCategoryFilters
                                                                }
                                                                className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
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
                                                                className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors"
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
                                                                    className="w-4 h-4 rounded cursor-pointer accent-purple-500"
                                                                />
                                                                <span className="text-sm text-slate-200">
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
                                </div>
                            </div>

                            {/* Games Grid */}
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {visibleGames.map((game) => (
                                    <li
                                        key={game.appid}
                                        className="group flex items-center gap-3 backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 transition-all hover:scale-105 hover:shadow-lg relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-linear-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <Image
                                            src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                                            width={40}
                                            height={40}
                                            alt=""
                                            className="rounded-lg shrink-0 relative z-10"
                                        />
                                        <span className="font-semibold text-white text-sm flex-1 relative z-10 line-clamp-2">
                                            {game.name}
                                        </span>
                                        <button
                                            onClick={() => hideGame(game.appid)}
                                            className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500 text-white sm:opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-bold shrink-0 relative z-10"
                                            aria-label="Hide game"
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Spinner Section */}
                        <div className="flex flex-col items-center w-full">
                            <button
                                onClick={() => {
                                    setShowSpinner(!showSpinner);
                                }}
                                className="rounded-xl px-8 py-4 bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105"
                            >
                                {showSpinner ? "Hide Spinner" : "Open Spinner"}
                            </button>
                            {showSpinner && (
                                <div className="mt-8 w-full">
                                    <Spinner games={visibleGames} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {allUsers.length === 0 && (
                    <div className="text-center py-16 space-y-4">
                        <h3 className="text-2xl font-bold text-white max-w-lg">
                            Add Steam users above to discover shared games and
                            decide what to play together
                        </h3>
                        <p className="text-slate-300  mx-auto"></p>
                    </div>
                )}
            </main>
        </div>
    );
}
