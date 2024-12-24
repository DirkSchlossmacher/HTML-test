// --------------------------------------------------------------------------
// Parameter eines Roulette-Spiels:
// Bei europäischem Roulette gibt es 37 Felder (0-36), wobei Rot/Schwarz
// jeweils 18 Felder sind und die 0 den Bankvorteil ermöglicht.
// --------------------------------------------------------------------------

// Globale Variablen (für Chart etc.)
let chart = null;

/**
 * Simulation einer Roulette-Drehung.
 * Gibt "red", "black", "odd", "even" oder "zero" als Ergebnis zurück.
 */
function spinRoulette() {
  // Zufallszahl 0 bis 36
  const number = Math.floor(Math.random() * 37);

  if (number === 0) {
    return "zero";
  }

  const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number);
  const isOdd = (number % 2 !== 0);

  if (isRed && isOdd) return "red_odd";
  if (isRed && !isOdd) return "red_even";
  if (!isRed && isOdd) return "black_odd";
  if (!isRed && !isOdd) return "black_even";
}

/**
 * Prüft, ob der Spieler mit der gewählten einfachen Chance (betChoice)
 * gewonnen oder verloren hat. Bei Zero geht der Einsatz verloren (ohne La Partage).
 * @param {string} outcome - Ergebnis der Drehung ("red_odd", "black_even", etc.).
 * @param {string} betChoice - z. B. "red", "black", "odd", "even".
 * @returns {boolean} true = gewonnen, false = verloren
 */
function didWin(outcome, betChoice) {
  if (outcome === "zero") {
    return false;
  }
  // outcome kann bspw. "red_odd" sein
  const [color, parity] = outcome.split("_");
  switch (betChoice) {
    case "red":
      return color === "red";
    case "black":
      return color === "black";
    case "odd":
      return parity === "odd";
    case "even":
      return parity === "even";
    default:
      return false;
  }
}

/**
 * Führt eine komplette Simulation durch.
 */
function runSimulation() {
  // Einlesen der Eingabedaten
  let startingBalance = parseInt(document.getElementById("startingBalance").value, 10);
  let betAmount = parseInt(document.getElementById("betAmount").value, 10);
  const strategy = document.getElementById("strategy").value;
  const rounds = parseInt(document.getElementById("rounds").value, 10);
  const betChoice = document.getElementById("betChoice").value;

  // Anfangswerte
  let balance = startingBalance;
  let currentBet = betAmount;
  let results = [];
  let totalWins = 0;
  let totalLosses = 0;

  for (let i = 0; i < rounds; i++) {
    const outcome = spinRoulette();
    const win = didWin(outcome, betChoice);
    
    if (win) {
      // Bei einer einfachen Chance liegt der Gewinnfaktor bei 1:1 (ohne Zero-Regelungen)
      balance += currentBet; 
      totalWins++;
      // Strategie-spezifisch
      if (strategy === "martingale") {
        // Nach Gewinn: Einsatz zurücksetzen
        currentBet = betAmount;
      }
    } else {
      balance -= currentBet;
      totalLosses++;
      // Bei Martingale verdoppeln wir nach Verlust den Einsatz
      if (strategy === "martingale") {
        currentBet = currentBet * 2;
      }
      // Achtung: Hier könnte man noch weitere Abbruchbedingungen definieren,
      // wenn z. B. das Geld ausgeht, um negative Bilanzen zu verhindern.
      if (balance < 0) {
        // Stoppen, falls alles verloren ist
        break;
      }
    }
    // Für das Chart Tracking
    results.push(balance);
  }

  // Ergebniswerte in HTML anzeigen
  document.getElementById("finalBalance").textContent = 
    `Endguthaben: ${balance.toFixed(2)} (Start: ${startingBalance})`;
  document.getElementById("totalWins").textContent = 
    `Gewinne: ${totalWins}`;
  document.getElementById("totalLosses").textContent = 
    `Verluste: ${totalLosses}`;

  // Chart zeichnen
  drawChart(results);
}

/**
 * Zeichnet den Verlauf des Kontostands als Liniendiagramm.
 * Nutzt Canvas 2D API für ein sehr einfaches Chart.
 */
function drawChart(data) {
  // Canvas-Element und Kontext holen
  const canvas = document.getElementById("balanceChart");
  const ctx = canvas.getContext("2d");

  // Canvas bereinigen
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data.length === 0) return;

  // Min und Max ermitteln
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);

  // Randwerte für das Chart
  const padding = 20;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;

  // Skalenfaktoren
  const xScale = chartWidth / (data.length - 1);
  const yScale = (maxVal - minVal) || 1; // Falls maxVal == minVal

  // Pfad beginnen
  ctx.beginPath();
  ctx.strokeStyle = "#007bff";
  ctx.lineWidth = 2;

  data.forEach((value, index) => {
    // (x, y) Koordinaten berechnen
    const x = padding + index * xScale;
    // invertierte y-Koordinate, da im Canvas 0 oben ist
    const y = padding + (maxVal - value) * (chartHeight / yScale);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();
}

/**
 * Initialisierung
 */
document.getElementById("simulateBtn").addEventListener("click", runSimulation);
