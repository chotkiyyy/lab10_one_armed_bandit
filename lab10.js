document.addEventListener("DOMContentLoaded", () => {
    const setupScreen = document.getElementById("setup-screen");
    const gameScreen = document.getElementById("game-screen");
    const usernameInput = document.getElementById("username-input");
    const startBtn = document.getElementById("start-btn");
    const errorMsg = document.getElementById("error-msg");

    const displayName = document.getElementById("display-name");
    const balanceBadge = document.getElementById("balance-badge");
    const addMoneyBtn = document.getElementById("add-money-btn");
    const attemptBadge = document.getElementById("attempt-badge");
    const betInput = document.getElementById("bet-input");
    const statusText = document.getElementById("status-text");

    const spinBtn = document.getElementById("spin-btn");
    const changeBtn = document.getElementById("chng-btn");

    const defaultImg = "https://img-cdn.hltv.org/eventlogo/PhVPy7kXO_J_nfTng7a87h.png?ixlib=java-2.1.0&w=200&s=7a1dd4079a079fb5c5133dea996cc5f0";

    const items = [
        { name: "B8", multiplier: 1.5, weight: 35, img: "https://img-cdn.hltv.org/teamlogo/rUIL5D299QDtRjXR2rxqV_.png?ixlib=java-2.1.0&w=100&s=4abc989b611fbbc5a8d2daea4dd261cf" },
        { name: "G2", multiplier: 2, weight: 25, img: "https://img-cdn.hltv.org/teamlogo/zFLwAELOD15BjJSDMMNBWQ.png?ixlib=java-2.1.0&w=100&s=88aeba1564bc27de69fb2302e47e1a7c" },
        { name: "FaZe", multiplier: 3, weight: 18, img: "https://img-cdn.hltv.org/teamlogo/Wo9goa1eRNUtd6NLvrmwW8.png?ixlib=java-2.1.0&w=100&s=6f96eec7c51667d10b964e8b69e8d336" },
        { name: "Vitality", multiplier: 4, weight: 14, img: "https://img-cdn.hltv.org/teamlogo/yeXBldn9w8LZCgdElAenPs.png?ixlib=java-2.1.0&w=100&s=a0731380d1075205aadb30905a49da55" },
        { name: "NAVI", multiplier: 5, weight: 8, img: "https://img-cdn.hltv.org/teamlogo/9iMirAi7ArBLNU8p3kqUTZ.svg?ixlib=java-2.1.0&s=4dd8635be16122656093ae9884675d0c" }
    ];

    let userName = "";
    let balance = 1000;
    let currentBet = 100;
    let currentAttempt = 0;
    const maxAttempts = 3;
    let isSpinning = false;

    function updateBalanceUI() {
        balanceBadge.textContent = `Баланс: ${balance}$`;
    }

    addMoneyBtn.addEventListener("click", () => {
        balance += 1000;
        updateBalanceUI();
        statusText.classList.remove("lose-status");
        statusText.textContent = `Баланс поповнено на +1000$! Поточний рахунок: ${balance}$`;
    });

    function startGame() {
        const trimmedName = usernameInput.value.trim();

        if (trimmedName.length < 1) {
            errorMsg.textContent = "Введіть ім'я (мінімум 1 символ)!";
            usernameInput.style.borderColor = "#ef4444";
            return;
        }

        userName = trimmedName;
        displayName.textContent = userName;
        errorMsg.textContent = "";
        usernameInput.style.borderColor = "#334155";

        setupScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
    }

    startBtn.addEventListener("click", startGame);

    usernameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") startGame();
    });

    function getUniqueColumnItems() {
        const pool = [...items];
        const column = [];

        for (let i = 0; i < 3; i++) {
            const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
            let randomNum = Math.random() * totalWeight;
            let selectedIndex = 0;

            for (let j = 0; j < pool.length; j++) {
                randomNum -= pool[j].weight;
                if (randomNum <= 0) {
                    selectedIndex = j;
                    break;
                }
            }

            column.push(pool[selectedIndex]);
            pool.splice(selectedIndex, 1);
        }
        return column;
    }

    function renderColumn(colIndex, colItems, showNames = true) {
        for (let row = 0; row < 3; row++) {
            const cell = document.querySelector(`.slot-cell[data-row="${row}"][data-col="${colIndex}"]`);
            const imgEl = cell.querySelector("img");
            const infoEl = cell.querySelector(".card-info");

            imgEl.src = colItems[row].img;
            infoEl.textContent = showNames ? `${colItems[row].name} (x${colItems[row].multiplier})` : "";
        }
    }

    spinBtn.addEventListener("click", () => {
        if (isSpinning) return;

        statusText.classList.remove("win-status", "lose-status");

        if (currentAttempt === 0) {
            const enteredBet = parseInt(betInput.value, 10);

            if (isNaN(enteredBet) || enteredBet <= 0) {
                statusText.classList.add("lose-status");
                statusText.textContent = "Введіть коректну ставку (більше 0$)!";
                return;
            }

            if (enteredBet > balance) {
                statusText.classList.add("lose-status");
                statusText.textContent = "Недостатньо коштів на балансі! Зменшіть ставку або натисніть «+1000$».";
                return;
            }

            currentBet = enteredBet;
            balance -= currentBet;
            updateBalanceUI();

            betInput.disabled = true;
        }

        isSpinning = true;
        spinBtn.disabled = true;
        changeBtn.disabled = true;

        currentAttempt++;
        attemptBadge.textContent = `Спроба: ${currentAttempt} / ${maxAttempts}`;
        statusText.textContent = `Ставка ${currentBet}$ у грі. Крутимо барабани (Спроба ${currentAttempt} з ${maxAttempts})...`;

        document.querySelectorAll(".slot-cell").forEach(cell => cell.classList.remove("win-cell"));

        const finalGrid = [
            getUniqueColumnItems(),
            getUniqueColumnItems(),
            getUniqueColumnItems()
        ];

        const spinIntervals = [];

        for (let col = 0; col < 3; col++) {
            const reelEl = document.getElementById(`reel-${col}`);
            reelEl.classList.add("spinning");

            const interval = setInterval(() => {
                const tempItems = getUniqueColumnItems();
                renderColumn(col, tempItems, false);
            }, 80);

            spinIntervals.push(interval);
        }

        const baseDuration = 600;
        const stepDelay = 200;

        for (let col = 0; col < 3; col++) {
            setTimeout(() => {
                clearInterval(spinIntervals[col]);
                const reelEl = document.getElementById(`reel-${col}`);
                reelEl.classList.remove("spinning");

                renderColumn(col, finalGrid[col], true);

                if (col === 2) {
                    checkResult(finalGrid);
                    isSpinning = false;
                    spinBtn.disabled = false;
                    changeBtn.disabled = false;
                }
            }, baseDuration + col * stepDelay);
        }
    });

    function checkResult(grid) {
        let totalWinAmount = 0;
        const winningTeams = [];

        for (let row = 0; row < 3; row++) {
            const firstItem = grid[0][row];
            const secondItem = grid[1][row];
            const thirdItem = grid[2][row];

            if (firstItem.name === secondItem.name && secondItem.name === thirdItem.name) {
                const rowWin = Math.round(currentBet * firstItem.multiplier);
                totalWinAmount += rowWin;
                winningTeams.push(`${firstItem.name} (x${firstItem.multiplier})`);

                for (let col = 0; col < 3; col++) {
                    const winCell = document.querySelector(`.slot-cell[data-row="${row}"][data-col="${col}"]`);
                    winCell.classList.add("win-cell");
                }
            }
        }

        if (totalWinAmount > 0) {
            balance += totalWinAmount;
            updateBalanceUI();

            statusText.classList.add("win-status");
            statusText.textContent = `Перемога на спробі ${currentAttempt}! Випало: ${winningTeams.join(", ")}. Виграш: +${totalWinAmount}$! Можете крутити далі або змінити ставку.`;

            currentAttempt = 0;
            attemptBadge.textContent = `Спроба: 0 / ${maxAttempts}`;
            betInput.disabled = false;
            spinBtn.textContent = "Крутити барабан";
        } else if (currentAttempt >= maxAttempts) {
            statusText.classList.add("lose-status");
            statusText.textContent = `Ви програли ставку ${currentBet}$ (за 3 спроби ряд не випав). Крутіть знову з цією ж ставкою або змініть її!`;

            currentAttempt = 0;
            attemptBadge.textContent = `Спроба: 0 / ${maxAttempts}`;
            betInput.disabled = false;
            spinBtn.textContent = "Крутити барабан";
        } else {
            const left = maxAttempts - currentAttempt;
            statusText.textContent = `Спроба ${currentAttempt} з ${maxAttempts}: співпадінь немає. Залишилось спроб на цю ставку: ${left}.`;
            spinBtn.textContent = `Крутити далі (${currentAttempt} / ${maxAttempts})`;
        }
    }

    function resetBoard() {
        balance = 1000;          
        currentBet = 100;        
        betInput.value = "100";  
        updateBalanceUI();       

        currentAttempt = 0;
        isSpinning = false;
        spinBtn.disabled = false;
        changeBtn.disabled = false;
        betInput.disabled = false;
        spinBtn.textContent = "Крутити барабан";
        attemptBadge.textContent = `Спроба: 0 / ${maxAttempts}`;
        statusText.classList.remove("win-status", "lose-status");

        document.querySelectorAll(".reel").forEach(reel => reel.classList.remove("spinning"));

        document.querySelectorAll(".slot-cell").forEach(cell => {
            cell.classList.remove("win-cell");
            cell.querySelector("img").src = defaultImg;
            cell.querySelector(".card-info").textContent = "";
        });
    }

    changeBtn.addEventListener("click", () => {
        if (isSpinning) return;
        resetBoard();
        statusText.textContent = "Введіть ставку та натисніть «Крутити барабан»!";
        setupScreen.classList.remove("hidden");
        gameScreen.classList.add("hidden");
    });
});