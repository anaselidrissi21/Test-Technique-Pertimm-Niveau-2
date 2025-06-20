import 'dotenv/config';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

type StartGameResponse = {
	position_x: number;
	position_y: number;
	url_move: string;
	url_discover: string;
};

async function startGame(): Promise<StartGameResponse> {
	const player = process.env.PLAYER_NAME;

	if (!player) {
		throw new Error('❌ PLAYER_NAME env variable is not defined');
	}

	const response = await fetch(`${BASE_URL}/start-game/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json',
		},
		body: `player=${encodeURIComponent(player)}`,
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to start game: ${response.status} - ${error}`);
	}

	const data = await response.json();

	console.log('✅ Game started');
	console.log(`📍 Starting position: (${data.position_x}, ${data.position_y})`);
	console.log(`➡️  Move URL: ${data.url_move}`);
	console.log(`🧭 Discover URL: ${data.url_discover}`);

	return data;
}

async function main() {
	try {
		await startGame();
	} catch (error) {
		console.error(error);
	}
}

main();
