class SnakeAndLadderGame {
    constructor() {
        this.playerName = '';
        this.playerPosition = 1;
        this.diceValue = 0;
        this.gameOver = false;

        // Define snakes: key is head position, value is tail position
        this.snakes = {
            17: 4,
            28: 10,
            48: 30,
            56: 36,
            75: 55,
            87: 62,
            93: 73,
            99: 60
        };

        // Define ladders: key is bottom position, value is top position
        this.ladders = {
            3: 22,
            5: 14,
            9: 31,
            21: 42,
            45: 67,
            51: 72,
            72: 91,
            80: 99
        };

        this.initSounds();
        this.initEventListeners();
    }

    initSounds() {
        // Create audio context for generating sounds
        this.audioContext = null;
        this.masterGain = null;
    }

    playSound(type) {
        // Initialize audio context on first user interaction
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;
        }

        const now = this.audioContext.currentTime;

        switch (type) {
            case 'ladder':
                this.playLadderCheer();
                break;
            case 'snake':
                this.playSnakeHiss();
                break;
            case 'six':
                this.playSixCheer();
                break;
            case 'win':
                this.playWinFanfare();
                break;
        }
    }

    playLadderCheer() {
        const now = this.audioContext.currentTime;
        const baseFreq = 523.25; // C5

        // Create cheerful ascending notes
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            osc.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(0.1, now + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.2);

            osc.start(now + index * 0.1);
            osc.stop(now + index * 0.1 + 0.2);
        });
    }

    playSnakeHiss() {
        const now = this.audioContext.currentTime;

        // Create hissing sound using noise
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }

        // Create high-pass filter for hissing effect
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        filter.Q.value = 0.5;

        const gain = this.audioContext.createGain();
        const noiseSource = this.audioContext.createBufferSource();

        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noiseSource.start(now);
        noiseSource.stop(now + 0.4);

        // Add snake growl - low frequency
        const osc = this.audioContext.createOscillator();
        const growlGain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        osc.connect(growlGain);
        growlGain.connect(this.masterGain);

        growlGain.gain.setValueAtTime(0.1, now);
        growlGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playSixCheer() {
        const now = this.audioContext.currentTime;

        // Create celebratory fanfare
        const notes = [
            { freq: 523.25, time: 0 },     // C5
            { freq: 659.25, time: 0.1 },   // E5
            { freq: 783.99, time: 0.2 },   // G5
            { freq: 1046.5, time: 0.3 }    // C6
        ];

        notes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            osc.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(0.15, now + note.time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.15);

            osc.start(now + note.time);
            osc.stop(now + note.time + 0.15);
        });
    }

    playWinFanfare() {
        const now = this.audioContext.currentTime;

        // Create triumphant fanfare
        const sequence = [
            { freq: 523.25, duration: 0.3 },   // C5
            { freq: 659.25, duration: 0.3 },   // E5
            { freq: 783.99, duration: 0.3 },   // G5
            { freq: 1046.5, duration: 0.6 }    // C6 (longer)
        ];

        let time = 0;
        sequence.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            osc.connect(gain);
            gain.connect(this.masterGain);

            gain.gain.setValueAtTime(0.2, now + time);
            gain.gain.exponentialRampToValueAtTime(0.01, now + time + note.duration);

            osc.start(now + time);
            osc.stop(now + time + note.duration);

            time += note.duration;
        });
    }

    initEventListeners() {
        document.getElementById('nameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });

        document.getElementById('rollBtn').addEventListener('click', () => {
            this.rollDice();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.playAgain();
        });
    }

    startGame() {
        this.playerName = document.getElementById('playerName').value.trim();
        if (!this.playerName) {
            alert('Please enter your name');
            return;
        }

        // Hide welcome modal
        document.getElementById('welcomeModal').classList.remove('active');

        // Show game container
        document.getElementById('gameContainer').classList.remove('hidden');

        // Update player info
        document.getElementById('playerDisplay').textContent = `Player: ${this.playerName}`;

        // Initialize the board
        this.initializeBoard();

        // Update UI
        this.updateDisplay();
        this.showMessage(`Welcome, ${this.playerName}! Roll the dice to start.`, 'normal');
    }

    initializeBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';

        // Create squares 1-100 in reverse row order (100 at top-left)
        for (let i = 100; i >= 1; i--) {
            const square = document.createElement('div');
            square.className = 'square';
            square.id = `square-${i}`;
            square.textContent = i;

            // Mark snake and ladder squares
            if (this.snakes[i]) {
                square.classList.add('snake-start');
                square.innerHTML = `${i}<div class="snake-icon">🐍</div>`;
            } else if (this.ladders[i]) {
                square.classList.add('ladder-start');
                square.innerHTML = `${i}<div class="ladder-icon">🪜</div>`;
            }

            board.appendChild(square);
        }

        // Draw snakes and ladders on SVG
        this.drawSnakesAndLadders();

        // Place player on square 1
        this.updatePlayerPosition(1);
    }

    getSquareCenter(squareNumber) {
        const boardElement = document.getElementById('gameBoard');
        const square = document.getElementById(`square-${squareNumber}`);

        if (!square || !boardElement) return null;

        const boardRect = boardElement.getBoundingClientRect();
        const squareRect = square.getBoundingClientRect();
        const boardContainerRect = document.querySelector('.board-container').getBoundingClientRect();

        const x = squareRect.left - boardContainerRect.left + squareRect.width / 2;
        const y = squareRect.top - boardContainerRect.top + squareRect.height / 2;

        return { x, y };
    }

    drawSnakesAndLadders() {
        const svg = document.getElementById('snakeLadderSvg');
        svg.innerHTML = '';

        const svgNS = 'http://www.w3.org/2000/svg';

        // Draw ladders with prominent vertical lines
        Object.entries(this.ladders).forEach(([start, end]) => {
            const startPos = this.getSquareCenter(parseInt(start));
            const endPos = this.getSquareCenter(parseInt(end));

            if (startPos && endPos) {
                const rungWidth = 20;
                const numRungs = Math.max(8, Math.abs(parseInt(end) - parseInt(start)) / 5);

                // Left side line
                const leftLine = document.createElementNS(svgNS, 'line');
                leftLine.setAttribute('class', 'ladder-side');
                leftLine.setAttribute('x1', startPos.x - rungWidth / 2);
                leftLine.setAttribute('y1', startPos.y);
                leftLine.setAttribute('x2', endPos.x - rungWidth / 2);
                leftLine.setAttribute('y2', endPos.y);
                svg.appendChild(leftLine);

                // Right side line
                const rightLine = document.createElementNS(svgNS, 'line');
                rightLine.setAttribute('class', 'ladder-side');
                rightLine.setAttribute('x1', startPos.x + rungWidth / 2);
                rightLine.setAttribute('y1', startPos.y);
                rightLine.setAttribute('x2', endPos.x + rungWidth / 2);
                rightLine.setAttribute('y2', endPos.y);
                svg.appendChild(rightLine);

                // Horizontal rungs
                for (let i = 0; i <= numRungs; i++) {
                    const t = i / numRungs;
                    const x = startPos.x + (endPos.x - startPos.x) * t;
                    const y = startPos.y + (endPos.y - startPos.y) * t;

                    const rung = document.createElementNS(svgNS, 'line');
                    rung.setAttribute('class', 'ladder-rung');
                    rung.setAttribute('x1', x - rungWidth / 2);
                    rung.setAttribute('y1', y);
                    rung.setAttribute('x2', x + rungWidth / 2);
                    rung.setAttribute('y2', y);
                    svg.appendChild(rung);
                }

                // Add label showing ladder direction
                const midX = (startPos.x + endPos.x) / 2 + 35;
                const midY = (startPos.y + endPos.y) / 2;
                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('class', 'ladder-label');
                label.setAttribute('x', midX);
                label.setAttribute('y', midY);
                label.setAttribute('text-anchor', 'middle');
                label.textContent = `${parseInt(start)}→${parseInt(end)}`;
                svg.appendChild(label);
            }
        });

        // Draw snakes
        Object.entries(this.snakes).forEach(([head, tail]) => {
            const headPos = this.getSquareCenter(parseInt(head));
            const tailPos = this.getSquareCenter(parseInt(tail));

            if (headPos && tailPos) {
                // Create curved path for snake using Bezier curve
                const midX = (headPos.x + tailPos.x) / 2;
                const controlX = headPos.x > tailPos.x ? midX + 50 : midX - 50;

                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('class', 'snake-path');
                path.setAttribute(
                    'd',
                    `M ${headPos.x} ${headPos.y} Q ${controlX} ${(headPos.y + tailPos.y) / 2} ${tailPos.x} ${tailPos.y}`
                );
                svg.appendChild(path);

                // Add arrowhead to snake
                const angle = Math.atan2(tailPos.y - headPos.y, tailPos.x - headPos.x);
                const arrowSize = 12;
                const arrowX = tailPos.x - arrowSize * Math.cos(angle);
                const arrowY = tailPos.y - arrowSize * Math.sin(angle);

                const arrow = document.createElementNS(svgNS, 'polygon');
                arrow.setAttribute('class', 'snake-arrow');
                arrow.setAttribute('points',
                    `${tailPos.x},${tailPos.y} ${arrowX - 6 * Math.sin(angle)},${arrowY + 6 * Math.cos(angle)} ${arrowX + 6 * Math.sin(angle)},${arrowY - 6 * Math.cos(angle)}`
                );
                svg.appendChild(arrow);

                // Add label showing snake direction
                const labelX = (headPos.x + tailPos.x) / 2 - 35;
                const labelY = (headPos.y + tailPos.y) / 2;
                const label = document.createElementNS(svgNS, 'text');
                label.setAttribute('class', 'snake-label');
                label.setAttribute('x', labelX);
                label.setAttribute('y', labelY);
                label.setAttribute('text-anchor', 'middle');
                label.textContent = `${parseInt(head)}→${parseInt(tail)}`;
                svg.appendChild(label);
            }
        });
    }

    updatePlayerPosition(newPosition) {
        // Remove player token from all squares
        document.querySelectorAll('.player-token').forEach(token => token.remove());
        document.querySelectorAll('.square').forEach(sq => sq.classList.remove('player-here'));

        // Add player token to new square
        const newSquare = document.getElementById(`square-${newPosition}`);
        if (newSquare) {
            const token = document.createElement('div');
            token.className = 'player-token';
            newSquare.appendChild(token);
            newSquare.classList.add('player-here');
        }

        this.playerPosition = newPosition;
        document.getElementById('positionDisplay').textContent = `Position: ${newPosition}`;
    }

    rollDice() {
        if (this.gameOver) return;

        // Generate random number 1-6
        this.diceValue = Math.floor(Math.random() * 6) + 1;

        // Animate dice with spinning numbers
        const diceElement = document.getElementById('diceDisplay');
        diceElement.classList.add('rolling');

        // Show spinning effect with random numbers
        let spins = 0;
        const spinInterval = setInterval(() => {
            const randomNum = Math.floor(Math.random() * 6) + 1;
            diceElement.textContent = randomNum;
            spins++;

            if (spins > 12) {
                clearInterval(spinInterval);
                diceElement.textContent = this.diceValue;
                document.getElementById('diceValue').textContent = this.diceValue;

                setTimeout(() => {
                    diceElement.classList.remove('rolling');
                    this.movePlayer();
                }, 400);
            }
        }, 50);
    }

    movePlayer() {
        let newPosition = this.playerPosition + this.diceValue;

        // Check if move is valid
        if (newPosition > 100) {
            this.showMessage(`You rolled ${this.diceValue}. Move too far! Stay at ${this.playerPosition}.`, 'normal');
            return;
        }

        // Check for 6 - party popper celebration
        if (this.diceValue === 6) {
            this.celebrateRolledSix();
        }

        // Check for snake
        if (this.snakes[newPosition]) {
            this.updatePlayerPosition(newPosition);
            this.playSound('snake');
            const snakeTail = this.snakes[newPosition];
            setTimeout(() => {
                this.showMessage(`🐍 Oh no! Snake at ${newPosition}! Sliding down to ${snakeTail}.`, 'snake');
                this.updatePlayerPosition(snakeTail);
            }, 500);
            return;
        }

        // Check for ladder
        if (this.ladders[newPosition]) {
            this.updatePlayerPosition(newPosition);
            this.playSound('ladder');
            const ladderTop = this.ladders[newPosition];
            setTimeout(() => {
                this.showMessage(`🪜 Great! Ladder at ${newPosition}! Climbing up to ${ladderTop}.`, 'ladder');
                this.updatePlayerPosition(ladderTop);
            }, 500);
            return;
        }

        // Move to new position
        this.updatePlayerPosition(newPosition);
        this.showMessage(`You rolled ${this.diceValue}. Now at ${newPosition}.`, 'normal');

        // Check for win
        if (newPosition === 100) {
            this.winGame();
        }
    }

    winGame() {
        this.gameOver = true;
        this.playSound('win');
        document.getElementById('rollBtn').disabled = true;

        setTimeout(() => {
            document.getElementById('gameOverTitle').textContent = '🎉 You Won!';
            document.getElementById('gameOverMessage').textContent = `Congratulations, ${this.playerName}! You reached square 100 and won the game!`;
            document.getElementById('gameOverModal').classList.add('active');
        }, 500);
    }

    resetGame() {
        document.getElementById('welcomeModal').classList.add('active');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('gameOverModal').classList.remove('active');

        this.playerPosition = 1;
        this.diceValue = 0;
        this.gameOver = false;
        document.getElementById('playerName').value = '';
        document.getElementById('playerName').focus();
        document.getElementById('rollBtn').disabled = false;
    }

    playAgain() {
        document.getElementById('gameOverModal').classList.remove('active');
        this.playerPosition = 1;
        this.diceValue = 0;
        this.gameOver = false;
        document.getElementById('rollBtn').disabled = false;
        this.initializeBoard();
        setTimeout(() => this.drawSnakesAndLadders(), 100);
        this.updateDisplay();
        this.showMessage(`Let's play again, ${this.playerName}! Good luck!`, 'normal');
    }

    showMessage(text, type = 'normal') {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
    }

    celebrateRolledSix() {
        this.playSound('six');
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA502', '#F7B731', '#5F27CD', '#00D2D3', '#FF9FF3'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--delay', Math.random() * 0.5 + 's');
            confetti.style.setProperty('--duration', (Math.random() * 1 + 1.5) + 's');
            confetti.style.setProperty('--fall-distance', Math.random() * 400 + 200 + 'px');
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }

        this.showMessage('🎉 LUCKY SIX! 🎉', 'six');
    }

    updateDisplay() {
        document.getElementById('positionDisplay').textContent = `Position: ${this.playerPosition}`;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SnakeAndLadderGame();
    document.getElementById('playerName').focus();
});
