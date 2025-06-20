import 'dotenv/config';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

type StartGameResponse = {
	position_x: number;
	position_y: number;
	url_move: string;
	url_discover: string;
};

type Cell = {
	x: number;
	y: number;
	move: boolean;
	value: string; // 'wall', 'path', etc.
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
		},
		body: new URLSearchParams({ player }),
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

async function discoverSurroundings(url: string, currentX: number, currentY: number): Promise<void> {
	const response = await fetch(url);

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to discover surroundings: ${response.status} - ${error}`);
	}

	const cells: Cell[] = await response.json();

	const top = cells.find(c => c.x === currentX && c.y === currentY - 1);
	const bottom = cells.find(c => c.x === currentX && c.y === currentY + 1);
	const left = cells.find(c => c.x === currentX - 1 && c.y === currentY);
	const right = cells.find(c => c.x === currentX + 1 && c.y === currentY);

	console.log('🔎 Discovered surroundings:');
	console.log(`⬆️  Top: ${top?.value ?? 'unknown'} (move: ${top?.move ?? '-'})`);
	console.log(`⬇️  Bottom: ${bottom?.value ?? 'unknown'} (move: ${bottom?.move ?? '-'})`);
	console.log(`⬅️  Left: ${left?.value ?? 'unknown'} (move: ${left?.move ?? '-'})`);
	console.log(`➡️  Right: ${right?.value ?? 'unknown'} (move: ${right?.move ?? '-'})`);
}

async function main() {
	try {
		const { position_x, position_y, url_discover } = await startGame();
		await discoverSurroundings(url_discover, position_x, position_y);
	} catch (error) {
		console.error(error);
	}
}

main();
