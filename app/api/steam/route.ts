import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const steamId = request.nextUrl.searchParams.get('steamid');
    
    if (!steamId) {
        return NextResponse.json({ error: 'Steam ID required' }, { status: 400 });
    }

    try {
       const [gamesResponse, userResponse] = await Promise.all([
            fetch(
                `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.NEXT_PUBLIC_STEAM_KEY}&steamid=${steamId}&include_appinfo=true`
            ),
            fetch(
                `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.NEXT_PUBLIC_STEAM_KEY}&steamids=${steamId}`
            )
        ]);
        const gamesData = await gamesResponse.json();
        const userData = await userResponse.json();

        const {avatarfull, personaname, steamid} = userData.response.players[0]

        const formattedGames = gamesData.response.games.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (game: any) => {
                return {
                    name: game.name,
                    img_icon_url: game.img_icon_url,
                    appid: game.appid
                };
            }
        );

        // Combine both responses
        return NextResponse.json({
            games: formattedGames,
            avatar: avatarfull,
            name: personaname,
            id: steamid
        });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}