import 'dotenv/config';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

type StartGameResponse = {
	player: string;
	position_x: number;
	position_y: number;
	dead: boolean;
	win: boolean;
	url_move: string;
	url_discover: string;
};

type Discovery = {
	x: number;
	y: number;
	move: boolean;
	value: string;
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

async function startGame(): Promise<StartGameResponse> {
	const player = process.env.PLAYER_NAME;
	if (!player) throw new Error('❌ PLAYER_NAME env variable is not defined');

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

async function discover(url: string): Promise<Discovery[]> {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`❌ Failed to discover surroundings: ${response.status}`);
	return response.json();
}

async function move(url: string, direction: string, x: number, y: number): Promise<MoveResponse> {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			move: direction,
			position_x: x.toString(),
			position_y: y.toString(),
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`❌ Failed to move: ${response.status} - ${error}`);
	}

	return response.json();
}

async function main() {
	try {
		const game = await startGame();
		const discovery = await discover(game.url_discover);

		const directions: Record<string, { x: number; y: number }> = {
			top: { x: game.position_x, y: game.position_y - 1 },
			bottom: { x: game.position_x, y: game.position_y + 1 },
			left: { x: game.position_x - 1, y: game.position_y },
			right: { x: game.position_x + 1, y: game.position_y },
		};

		const movable = discovery.find((cell) => cell.move);
		if (!movable) {
			console.log('🚫 No possible moves from current position.');
			return;
		}

		const direction = Object.entries(directions).find(
			([, coords]) => coords.x === movable.x && coords.y === movable.y
		)?.[0];

		if (!direction) {
			console.log('❓ Could not determine direction to move.');
			return;
		}

		const result = await move(game.url_move, direction, game.position_x, game.position_y);
		console.log(`🚶 Moved ${direction} to (${result.position_x}, ${result.position_y})`);
	} catch (error) {
		console.error(error);
	}
}

main();
