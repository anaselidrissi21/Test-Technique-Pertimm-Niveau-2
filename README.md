# 🧩 Pertimm Maze Game - Technical Test

This project is a solution to the Pertimm Level 2 technical challenge.  
It implements an automated exploration algorithm to navigate a maze and reach the end.

## 🚀 Features

- Starts a new game session using the Pertimm API  
- Automatically explores the maze using depth-first search with backtracking  
- Handles traps, dead-ends, and winning conditions  
- Prevents revisiting cells  
- Logs each step of the exploration for better visibility  

## 🛠️ Technologies

- Node.js  
- TypeScript  
- node-fetch for HTTP requests  
- dotenv for environment configuration  

## 📦 Installation

```bash
git clone https://github.com/your-username/Test-Technique-Pertimm-Niveau-2.git
cd Test-Technique-Pertimm-Niveau-2
npm install
```

## ⚙️ Configuration

Create a `.env` file at the root of the project:

```env
PLAYER_NAME=your_player_name
```

Replace `your_player_name` with the name provided for the test.

## ▶️ Usage

```bash
npm run build && npm run start
```

You’ll see the maze exploration process in the console step-by-step.

## 📂 Structure

- `src/index.ts`: Main logic of the game (start, move, discover, explore)  
- `dist/`: Compiled JS output  
- `.env`: Player configuration  

## ✅ Example Output

```
✅ Game started  
📍 Starting position: (1, 3)  
🔍 Exploring from (1, 3)  
➡️ Moved to (2, 3)  
...  
🎉 You win!
```




