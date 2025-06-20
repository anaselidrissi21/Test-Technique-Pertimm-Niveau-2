import 'dotenv/config';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

type DiscoverTile = {
	x: number;
	y: number;
	move: boolean;
	value: 'path' | 'wall' | 'trap' | 'exit';
};

type StartGameResponse = {
	position_x: number;
	position_y: number;
	url_move: string;
	url_discover: string;
};

type MoveResponse = {
	player: string;
	position_x: number;
	position_y: number;
	dead: boolean;
	win: boolean;
	url_move: string;
	url_discover: string;
};

let visited = new Set<string>();

async function startGame(): Promise<StartGameResponse> {
	const player = process.env.PLAYER_NAME;
	if (!player) throw new Error('❌ PLAYER_NAME env variable is not defined');

	const response = await fetch(`${BASE_URL}/start-game/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ player }),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to start game: ${response.status} - ${error}`);
	}

	const data = await response.json();
	console.log('✅ Game started');
	return data;
}

async function discover(url: string): Promise<DiscoverTile[]> {
	const response = await fetch(url);
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to discover: ${response.status} - ${error}`);
	}

	return await response.json();
}

async function move(
	url: string,
	x: number,
	y: number
): Promise<MoveResponse> {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ position_x: String(x), position_y: String(y) }),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to move: ${response.status} - ${error}`);
	}

	return await response.json();
}

async function explore(x: number, y: number, moveUrl: string, discoverUrl: string): Promise<boolean> {
	const key = `${x},${y}`;
	if (visited.has(key)) return false;
	visited.add(key);

	const tiles = await discover(discoverUrl);

	for (const tile of tiles) {
		const tileKey = `${tile.x},${tile.y}`;
		if (!tile.move || visited.has(tileKey)) continue;

		const moveRes = await move(moveUrl, tile.x, tile.y);
		console.log(`➡️  Moved to (${tile.x}, ${tile.y})`);

		if (moveRes.dead) {
			console.log(`☠️  Dead at (${tile.x}, ${tile.y})`);
			continue;
		}

		if (moveRes.win) {
			console.log(`🎉 Victory at (${tile.x}, ${tile.y})`);
			return true;
		}

		const foundExit = await explore(moveRes.position_x, moveRes.position_y, moveRes.url_move, moveRes.url_discover);
		if (foundExit) return true;
	}

	return false;
}

async function main() {
	try {
		const game = await startGame();
		await explore(game.position_x, game.position_y, game.url_move, game.url_discover);
	} catch (error) {
		console.error(error);
	}
}

main();
