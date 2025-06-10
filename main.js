const container = document.getElementById("container");
let minesLeft = document.getElementById("mines-left");
let myMines = document.getElementById("my-mines");
let timerDisplay = document.getElementById("timer");
let board = [];
const rows = 10;
const columns = 10;
let mines = 12;
let minesLocation = [];
let gameOver = false;
let timerInterval;
let seconds = 0;
let isFirstClick = true;

minesLeft.innerHTML = mines;
timerDisplay.innerHTML = "0";

window.onload = () => startGame();

function startGame() {
  let DDS = document.documentElement.style;
  DDS.setProperty("--row", rows);
  DDS.setProperty("--column", columns);
  DDS.setProperty("--bomb-flag-size", `${columns * 3}px`);
  DDS.setProperty("--tile-width", `${500 / columns}px`);
  DDS.setProperty("--tile-height", `${500 / rows}px`);

  seconds = 0;
  timerDisplay.innerHTML = "0";
  if (timerInterval) clearInterval(timerInterval);
  isFirstClick = true;

  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < columns; c++) {
      let tile = document.createElement("div");
      tile.id = `${r}-${c}`;

      container.appendChild(tile);
      row.push(tile.id);

      let pressTimer;
      tile.addEventListener("touchstart", function (e) {
        pressTimer = setTimeout(function () {
          handle_Flag_Click(tile)(e);
        }, 500);
      });

      tile.addEventListener("touchend", function (e) {
        clearTimeout(pressTimer);
      });

      tile.addEventListener("touchmove", function (e) {
        clearTimeout(pressTimer);
      });

      tile.addEventListener("click", handle_Click(tile));
      tile.addEventListener("contextmenu", handle_Flag_Click(tile));

      tile_data_mine(tile);
    }
    board.push(row);
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let id = `${r}-${c}`;
      let tile = document.getElementById(id);
      tile_data_number(tile);
    }
  }
}

function handle_Click(tile) {
  return function () {
    if (
      gameOver ||
      tile.dataset.flag === "flag" ||
      tile.classList.contains("tile-clicked")
    )
      return;

    if (isFirstClick) {
      if (tile.dataset.state !== "0") {
        minesLocation = [];
        set_mines();

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            let id = `${r}-${c}`;
            let currentTile = document.getElementById(id);
            tile_data_mine(currentTile);
          }
        }

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < columns; c++) {
            let id = `${r}-${c}`;
            let currentTile = document.getElementById(id);
            tile_data_number(currentTile);
          }
        }

        handle_Click(tile)();
        return;
      }

      timerInterval = setInterval(updateTimer, 1000);
      isFirstClick = false;
    }

    if (tile.dataset.state === "M") {
      tile.innerHTML = "<i class='fa-solid fa-bomb'></i>";
      tile.style.background = "rgba(255, 0, 0, 0.85)";
      myMines.innerHTML = "YOU LOSE !";
      myMines.classList.add("loser");
      stopTimer();
      setTimeout(reveal_mines, 500);
      gameOver = true;
    }
    if (tile.dataset.state === "0") {
      tile.classList.add("tile-clicked");
      check_Neighbors(tile);
      check_winner();
    }
    if (tile.dataset.state > "0" && tile.dataset.state < "9") {
      tile.classList.add("tile-clicked");
      tile.innerHTML = tile.dataset.state;
      numbers_color(tile);
      check_winner();
    }
  };
}

function handle_Flag_Click(tile) {
  return function (e) {
    e.preventDefault();
    if (gameOver || tile.classList.contains("tile-clicked")) return;

    if (tile.dataset.flag !== "flag") {
      if (minesLeft.innerHTML <= 0) return;
      minesLeft.innerHTML--;
      tile.setAttribute("data-flag", "flag");
      tile.innerHTML = "<i class='fa-solid fa-flag'></i>";
    } else {
      minesLeft.innerHTML++;
      tile.setAttribute("data-flag", "");
      tile.innerHTML = "";
    }
  };
}

function check_Neighbors(tile) {
  let splitId = tile.id.split("-");
  let r = parseInt(splitId[0]);
  let c = parseInt(splitId[1]);
  let cordinat = [
    [r - 1, c - 1],
    [r - 1, c],
    [r - 1, c + 1],
    [r, c + 1],
    [r + 1, c + 1],
    [r + 1, c],
    [r + 1, c - 1],
    [r, c - 1],
  ];

  for (let j = 0; j < cordinat.length; j++) {
    let neighbor = cordinat[j];
    let NR = neighbor[0];
    let NC = neighbor[1];

    if (NR >= 0 && NR < rows && NC >= 0 && NC < columns) {
      let NI = `${NR}-${NC}`;
      let NT = document.getElementById(NI);

      if (!NT.classList.contains("tile-clicked")) {
        if (NT.dataset.flag === "flag") {
          NT.removeAttribute("data-flag");
          NT.innerHTML = "";
          minesLeft.innerHTML++;
        }
        if (NT.dataset.state === "0") {
          NT.classList.add("tile-clicked");
          NT.innerHTML = "";
          setTimeout(() => check_Neighbors(NT), 20);
        } else if (NT.dataset.state !== "M") {
          NT.classList.add("tile-clicked");
          NT.innerHTML = NT.dataset.state;
          numbers_color(NT);
        }
      }
    }
  }
}

function tile_data_number(tile) {
  let splitId = tile.id.split("-");
  let r = parseInt(splitId[0]);
  let c = parseInt(splitId[1]);
  let bombCount = 0;
  let cordinat = [
    [r - 1, c - 1],
    [r - 1, c],
    [r - 1, c + 1],
    [r, c + 1],
    [r + 1, c + 1],
    [r + 1, c],
    [r + 1, c - 1],
    [r, c - 1],
  ];

  for (let i = 0; i < cordinat.length; i++) {
    let neighbor = cordinat[i];
    let NR = neighbor[0];
    let NC = neighbor[1];

    if (NR >= 0 && NR < rows && NC >= 0 && NC < columns) {
      let NI = `${NR}-${NC}`;
      let NT = document.getElementById(NI);

      if (NT && tile.dataset.state !== "M" && NT.dataset.state === "M")
        bombCount++;
    }
  }

  if (bombCount > 0 && bombCount < 9) {
    tile.setAttribute("data-state", bombCount);
  } else if (tile.dataset.state !== "M") tile.setAttribute("data-state", "0");
  else tile.setAttribute("data-state", "M");
}

function check_winner() {
  let emptyTiles = rows * columns - mines;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let box = document.getElementById(`${r}-${c}`);
      if (box.classList.contains("tile-clicked")) emptyTiles--;
      if (emptyTiles === 0) {
        myMines.innerHTML = "YOU WIN !";
        myMines.classList.add("winner");
        stopTimer();
        gameOver = true;
        setTimeout(reveal_mines, 500);
      }
    }
  }
}

function reveal_mines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      let tile = document.getElementById(`${r}-${c}`);
      if (tile.dataset.state === "M") {
        tile.innerHTML = "<i class='fa-solid fa-bomb'></i>";
        if (myMines.classList.contains("loser")) {
          tile.style.background = "rgba(255, 0, 0, 0.85)";
        }
      }
    }
  }
}

function numbers_color(tile) {
  if (tile.dataset.state === "0") return;
  let num = parseInt(tile.innerText);
  tile.classList.add(`x${num}`);
}

// MINES
function set_mines() {
  while (minesLocation.length !== mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * columns);
    let tileId = `${r}-${c}`;

    if (!minesLocation.includes(tileId)) minesLocation.push(tileId);
  }
}
set_mines();

function tile_data_mine(tile) {
  tile.setAttribute("data-state", "0");
  for (let p = 0; p < minesLocation.length; p++)
    if (minesLocation[p] == tile.id) tile.setAttribute("data-state", "M");
}

// TIMER
function updateTimer() {
  seconds++;
  timerDisplay.innerHTML = seconds;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}
