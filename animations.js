// Breathing snake animation effects

// Enhanced breathing animation on page load
document.addEventListener('DOMContentLoaded', () => {
    updateSnakeAnimations();
});

function updateSnakeAnimations() {
    const snakeElements = document.querySelectorAll('.snake-icon');

    snakeElements.forEach((snake, index) => {
        // Add staggered animation for visual interest
        const delay = (index % 3) * 0.2;
        snake.style.animationDelay = `${delay}s`;

        // Add hover effect
        snake.addEventListener('mouseenter', () => {
            snake.style.animationDuration = '1s';
        });

        snake.addEventListener('mouseleave', () => {
            snake.style.animationDuration = '2s';
        });
    });
}

// Re-update animations when board is reinitialized
const originalInitializeBoard = SnakeAndLadderGame.prototype.initializeBoard;
SnakeAndLadderGame.prototype.initializeBoard = function() {
    originalInitializeBoard.call(this);
    updateSnakeAnimations();
};

// Enhanced visual feedback for dice animation
document.addEventListener('DOMContentLoaded', () => {
    const dice = document.getElementById('diceDisplay');

    // Add custom dice faces for visual variety
    const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

    if (dice) {
        // Add hover effect to dice
        dice.addEventListener('mouseenter', () => {
            dice.style.cursor = 'pointer';
            dice.style.transform = 'scale(1.1)';
        });

        dice.addEventListener('mouseleave', () => {
            dice.style.transform = 'scale(1)';
        });
    }
});

// Player token animation enhancement
document.addEventListener('DOMContentLoaded', () => {
    // Add glow effect for player token
    const style = document.createElement('style');
    style.textContent = `
        @keyframes playerGlow {
            0%, 100% {
                box-shadow: 0 0 10px rgba(102, 126, 234, 0.5),
                           0 4px 12px rgba(102, 126, 234, 0.6);
            }
            50% {
                box-shadow: 0 0 20px rgba(102, 126, 234, 0.8),
                           0 4px 12px rgba(102, 126, 234, 0.6);
            }
        }

        .player-token {
            animation: playerBounce 0.6s ease-in-out infinite,
                      playerGlow 2s ease-in-out infinite;
        }

        @keyframes smoothMove {
            to {
                transform: translate(0, 0);
            }
        }
    `;
    document.head.appendChild(style);
});

// Add visual feedback for board updates
function addSquareAnimations() {
    const squares = document.querySelectorAll('.square');

    squares.forEach(square => {
        square.addEventListener('mouseenter', function() {
            if (!this.querySelector('.player-token')) {
                this.style.transform = 'scale(1.05)';
                this.style.zIndex = '10';
            }
        });

        square.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.zIndex = '1';
        });
    });
}

// Update square animations when board is reinitialized
const originalInitializeBoard2 = SnakeAndLadderGame.prototype.initializeBoard;
SnakeAndLadderGame.prototype.initializeBoard = function() {
    originalInitializeBoard2.call(this);
    addSquareAnimations();
};

document.addEventListener('DOMContentLoaded', () => {
    addSquareAnimations();
});
