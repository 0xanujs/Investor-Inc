let playerMoney = 500;
let currentDay = 1;
let loanAmount = 500;
let bankMoney = 0;
const stores = [
    "Precision Cuts Barber", "MetroMart Convenience", "Frost & Co. Ice Cream",
    "Heritage Bakes & Co.", "Prime Meats Butchery", "EverBloom Floral",
    "Legacy Books & Stationery", "IronVault Thrift Exchange", "TechPro Repairs", "Joe’s Pizza Works"
];
let stocks = {};
let stockPrices = {};
const dailyExpenses = 20;
const weeklyExpenses = 120;
const maxDays = 30;
const winningAmount = 10000;

let financialAdviceProfitMultiplier = 1;
let insiderTradingProfitMultiplier = 1;
let bankBalance = 0;

let currentPrompt = null;
let currentPanel = 1;

function generateStockPrices() {
    stores.forEach(store => {
        stockPrices[store] = (Math.floor(Math.random() * 10) + 1) * 10;
        stocks[store] = 0;
    });
}

function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("comic").classList.remove("hidden");
}

function showNextPanel() {
    document.getElementById(`panel${currentPanel}`).classList.add("hidden");
    currentPanel++;
    if (currentPanel > 4) {
        document.getElementById("comic").classList.add("hidden");
        document.getElementById("game").style.display = "block";
        generateStockPrices();
        updateUI();
        playerMoney += 500;
        updateUI();
        return;
    }
    document.getElementById(`panel${currentPanel}`).classList.remove("hidden");
}

function saveGame() {
    const gameData = JSON.stringify({ playerMoney, currentDay, loanAmount, bankMoney, stocks, stockPrices, bankBalance });
    const blob = new Blob([gameData], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "InvestorIncSave.json";
    a.click();
}

function loadGame() {
    document.getElementById("loadFile").click();
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        const gameData = JSON.parse(e.target.result);
        playerMoney = gameData.playerMoney;
        currentDay = gameData.currentDay;
        loanAmount = gameData.loanAmount;
        bankMoney = gameData.bankMoney;
        stocks = gameData.stocks;
        stockPrices = gameData.stockPrices;
        bankBalance = gameData.bankBalance;
        startGame();
    };
    reader.readAsText(file);
}

function resetGame() {
    location.reload();
}

function openBuyPopup() {
    setupBuySellPanel("Buy Stocks");
}

function openSellPopup() {
    setupBuySellPanel("Sell Stocks");
}

function setupBuySellPanel(type) {
    let content = document.getElementById("buySellContent");
    content.innerHTML = `
        <h2 id="popup-title">${type}</h2>
        <label for="storeSelect">Choose Store:</label>
        <select id="storeSelect" onchange="updateTotalCost()"></select>
        <p id="stockPrice"></p>
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" min="1" value="1" onchange="updateTotalCost()">
        <p id="totalCost"></p>
        <button id="confirmButton">${type === "Buy Stocks" ? "Buy" : "Sell"}</button>
        <h2>Owned Stocks</h2>
        <div id="buySellOwnedStocks"></div>
    `;
    let storeSelect = content.querySelector("#storeSelect");
    stores.forEach(store => {
        let option = document.createElement("option");
        option.value = store;
        option.innerText = `${store} - $${stockPrices[store]}`;
        storeSelect.appendChild(option);
    });
    updateTotalCost();
    updateBuySellOwnedStocks();
    content.querySelector("#confirmButton").onclick = type === "Buy Stocks" ? buyStock : sellStock;
    document.getElementById("buySellPanel").classList.remove("hidden");
}

function closeBuySellPanel() {
    document.getElementById("buySellPanel").classList.add("hidden");
}

function getFinancialAdvice() {
    const cost = 100;
    if (playerMoney >= cost) {
        playerMoney -= cost;
        if (Math.random() < 0.2) {
            document.getElementById("finAdviceContent").innerHTML = "<p>You were scammed!</p>";
        } else {
            document.getElementById("finAdviceContent").innerHTML = "<p>2x on the next buy.</p>";
            financialAdviceProfitMultiplier = 2;
        }
        document.getElementById("finAdvicePanel").classList.remove("hidden");
        updateUI();
    } else {
        showModal("Insufficient funds for financial advice.");
    }
}

function closeFinAdvicePanel() {
    document.getElementById("finAdvicePanel").classList.add("hidden");
}

function doInsiderTrading() {
    const cost = 200;
    if (playerMoney >= cost) {
        playerMoney -= cost;
        if (Math.random() < 1/3) {
            document.getElementById("insiderContent").innerHTML = "<p>You got caught insider trading! Lost a day and fined $50.</p>";
            playerMoney -= 50;
            currentDay++;
        } else {
            document.getElementById("insiderContent").innerHTML = "<p>Insider trading successful! 3x profits!</p>";
            insiderTradingProfitMultiplier = 3;
        }
        document.getElementById("insiderPanel").classList.remove("hidden");
        updateUI();
    } else {
        showModal("Insufficient funds for insider trading.");
    }
}

function closeInsiderPanel() {
    document.getElementById("insiderPanel").classList.add("hidden");
}

function buyStock() {
    let store = document.getElementById("storeSelect").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    let cost = stockPrices[store] * quantity * financialAdviceProfitMultiplier;
    if (playerMoney >= cost) {
        playerMoney -= cost;
        stocks[store] += quantity;
        closeBuySellPanel();
        updateUI();
        financialAdviceProfitMultiplier = 1;
    } else {
        showModal("Insufficient funds!");
    }
}

function sellStock() {
    let store = document.getElementById("storeSelect").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    if (stocks[store] >= quantity) {
        let priceChange;
        if (stocks[store] > 70) {
            priceChange = (Math.floor(Math.random() * 20) + 1) * 10;
        } else {
            priceChange = (Math.floor(Math.random() * 16) - 5) * 10;
        }
        playerMoney += priceChange * quantity * insiderTradingProfitMultiplier;
        stocks[store] -= quantity;
        closeBuySellPanel();
        updateUI();
        generateStockPrices();
        insiderTradingProfitMultiplier = 1;
    } else {
        showModal("Insufficient stocks!");
    }
}

function updateUI() {
    document.getElementById("status").innerText = `Day: ${currentDay} | Money: $${playerMoney}`;
    document.getElementById("bankStatus").innerText = `Bank: $${bankBalance} | Goal: $10000`;
    updateOwnedStocks();
}

function updateOwnedStocks() {
    let stocksList = document.getElementById("stocksList");
    stocksList.innerHTML = "";
    for (const store in stocks) {
        if (stocks[store] > 0) {
            let stockDiv = document.createElement("div");
            stockDiv.innerText = `${store}: ${stocks[store]}`;
            stocksList.appendChild(stockDiv);
        }
    }
}

function toggleOptions() {
    let optionsMenu = document.getElementById("optionsMenu");
    optionsMenu.classList.toggle("hidden");
}

function endDay() {
    currentDay++;
    playerMoney -= dailyExpenses;
    if (currentDay % 7 === 0) {
        playerMoney -= weeklyExpenses;
        if (playerMoney < 0) {
            showModal("Loan shark beat you up!");
        }
    }
    if (playerMoney >= winningAmount) {
        showModal("You won! Goal: $10,000");
    }
    if (currentDay > maxDays) {
        showModal("You lost the game!");
    }
    if (playerMoney <= 0) {
      showModal("You lost the game!");
      document.getElementById("game").style.display = "none";
      document.getElementById("menu").style.display = "flex";
      playerMoney = 500;
      currentDay = 1;
      bankBalance = 0;
      stocks = {};
      stockPrices = {};
      generateStockPrices();
      updateUI();
    }
    generateStockPrices();
    applyBankInterest();
    updateUI();
}

function showDepositPrompt() {
    showInputPrompt("Enter amount to deposit:", depositMoney);
}

function showWithdrawPrompt() {
    showInputPrompt("Enter amount to withdraw:", withdrawMoney);
}

function showInputPrompt(promptText, callback) {
    currentPrompt = callback;
    document.getElementById("inputArea").innerHTML = `
        <p>${promptText}</p>
        <input type="number" id="userInput">
        <button onclick="handleUserInput()">Submit</button>
        <button onclick="closeInputPrompt()">Close</button>
    `;
}

function closeInputPrompt() {
    document.getElementById("inputArea").innerHTML = "";
    currentPrompt = null;
}

function handleUserInput() {
    const amount = parseInt(document.getElementById("userInput").value);
    if (currentPrompt) {
        currentPrompt(amount);
        currentPrompt = null;
    }
    document.getElementById("inputArea").innerHTML = "";
}

function depositMoney(amount) {
    if (amount > 0 && playerMoney >= amount) {
        playerMoney -= amount;
        bankBalance += amount;
        updateUI();
    } else {
        showModal("Invalid deposit amount.");
    }
}

function withdrawMoney(amount) {
    if (amount > 0 && bankBalance >= amount) {
        bankBalance -= amount;
        playerMoney += amount;
        updateUI();
    } else {
        showModal("Invalid withdrawal amount.");
    }
}

function applyBankInterest() {
    bankBalance *= 1.05;
}

function showModal(message) {
    document.getElementById("modalMessage").innerText = message;
    document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modal").classList.add("hidden");
}

function updateTotalCost() {
    let store = document.getElementById("storeSelect").value;
    let quantity = parseInt(document.getElementById("quantity").value);
    let total = stockPrices[store] * quantity;
    document.getElementById("stockPrice").innerText = `Stock Price: $${stockPrices[store]}`;
    document.getElementById("totalCost").innerText = `Total Cost: $${total}`;
}

function updateBuySellOwnedStocks() {
    let ownedStocksDiv = document.getElementById("buySellOwnedStocks");
    ownedStocksDiv.innerHTML = "";
    for (const store in stocks) {
        if (stocks[store] > 0) {
            let stockDiv = document.createElement("p");
            stockDiv.innerText = `${store}: ${stocks[store]}`;
            ownedStocksDiv.appendChild(stockDiv);
        }
    }
}