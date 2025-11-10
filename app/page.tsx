"use client";

import { FormEvent, useId, useState } from "react";

export default function Home() {
    const steamInputId = useId();
    const [userData, setUserData] = useState();

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const formJson = Object.fromEntries(formData.entries());

        fetch(
            `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.NEXT_PUBLIC_STEAM_KEY}&steamid=${formJson.steamID}`
        )
            .then((response) => response.json())
            .then((data) => {
                setUserData(data);
            })
            .catch((error) => {
                console.log(error);
            });

        console.log(formJson.steamID);
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <form
                    method="post"
                    onSubmit={handleSubmit}
                    className="flex gap-4"
                >
                    <div>
                        <label htmlFor={steamInputId} className="sr-only">
                            Steam ID
                        </label>
                        <input
                            id={steamInputId}
                            name="steamID"
                            placeholder="Enter Steam ID"
                            className="border border-solid border-black rounded-md px-4 py-2"
                        />
                    </div>
                    <button
                        type="submit"
                        className="border rounded-md px-4 py-1"
                    >
                        Submit
                    </button>
                </form>

                {userData && <pre>{userData}</pre>}
            </main>
        </div>
    );
}
