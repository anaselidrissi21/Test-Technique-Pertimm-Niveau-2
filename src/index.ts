import 'dotenv/config';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

type StartGameResponse = {
	position_x: number;
	position_y: number;
	url_move: string;
	url_discover: string;
};

type DiscoverCell = {
	x: number;
	y: number;
	move: boolean;
	value: string;
};

let moveUrl: string;
let discoverUrl: string;
let currentX: number;
let currentY: number;
const visited = new Set<string>();
let gameOver = false;

async function startGame(): Promise<void> {
	const player = process.env.PLAYER_NAME;
	if (!player) throw new Error('❌ PLAYER_NAME env variable is not defined');

	const form = new URLSearchParams();
	form.append('player', player);

	const response = await fetch(`${BASE_URL}/start-game/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: form.toString(),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to start game: ${response.status} - ${error}`);
	}

	const data: StartGameResponse = await response.json();
	currentX = data.position_x;
	currentY = data.position_y;
	moveUrl = data.url_move;
	discoverUrl = data.url_discover;

	console.log('✅ Game started');
	console.log(`📍 Starting position: (${currentX}, ${currentY})`);
}

async function discover(): Promise<DiscoverCell[]> {
	const response = await fetch(discoverUrl);
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to discover: ${response.status} - ${error}`);
	}
	return await response.json();
}

async function move(x: number, y: number): Promise<boolean> {
	if (gameOver) return false;

	const response = await fetch(moveUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ position_x: x.toString(), position_y: y.toString() }),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to move: ${response.status} - ${error}`);
	}

	const data = await response.json();

	if (data.dead) {
		console.log(`💀 Died at (${x}, ${y})`);
		return false;
	}

	currentX = data.position_x;
	currentY = data.position_y;
	moveUrl = data.url_move;
	discoverUrl = data.url_discover;

	console.log(`➡️  Moved to (${currentX}, ${currentY})`);

	if (data.win) {
		console.log('🎉 You win!');
		gameOver = true;
		return true;
	}

	return true;
}

async function exploreAndMove(): Promise<boolean> {
	if (gameOver) return true;

	const key = `${currentX},${currentY}`;
	if (visited.has(key)) return false;

	console.log(`🔍 Exploring from (${currentX}, ${currentY})`);
	visited.add(key);

	const surroundings = await discover();
	for (const cell of surroundings) {
		const nextKey = `${cell.x},${cell.y}`;
		if (!cell.move || visited.has(nextKey)) continue;

		const prevX = currentX;
		const prevY = currentY;

		const success = await move(cell.x, cell.y);
		if (!success || gameOver) return gameOver;

		const result = await exploreAndMove();
		if (result) return true;

		await move(prevX, prevY); // backtrack
	}

	return false;
}

async function main() {
	try {
		await startGame();
		const success = await exploreAndMove();
		if (!success && !gameOver) {
			console.log('🛑 No path to the end was found.');
		}
	} catch (error) {
		console.error(error);
	}
}

main();
