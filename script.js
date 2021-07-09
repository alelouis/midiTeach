class Miditeach {
  constructor() {
    this.playedNotes = new Array(12).fill(0);
    this.totalChords = 0;
    this.totalCorrect = 0;
    this.totalIncorrect = 0;
    this.notes = [
      "C",
      "C#\nDb",
      "D",
      "D#\nEb",
      "E",
      "F",
      "F#\nGb",
      "G",
      "G#\nAb",
      "A",
      "A#\nBb",
      "B",
    ];
    this.intervals = [
      "1",
      "2m",
      "2",
      "3m",
      "3",
      "4",
      "T",
      "5",
      "6m",
      "6",
      "7m",
      "7",
    ];
    this.formulas = {
      min: ["1", "3m", "5"],
      maj: ["1", "3", "5"],
      aug: ["1", "3", "T"],
      dim: ["1", "3", "4"],
      maj7: ["1", "3", "5", "7"],
      min7: ["1", "3m", "5", "7m"],
      dom: ["1", "3", "5", "7m"],
      minmaj7: ["1", "3m", "5", "7"],
    };
    this.formulaTexts = {
      min: "min",
      maj: "maj",
      aug: "aug",
      dim: "dim",
      maj7: "maj7",
      min7: "min7",
      dom: "7",
      minmaj7: "mM7",
    };
    this.formulaSelected = {
      min: false,
      maj: false,
      aug: false,
      dim: false,
      maj7: false,
      min7: false,
      dom: false,
      minmaj7: false,
    };
    this.selectChord("min");
    this.selectChord("maj");
    this.sampleNextChord();
  }

  randChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  sampleNextChord() {
    this.playedNotes = new Array(12).fill(0);

    this.formulaName = this.randChoice(
      Object.entries(this.formulaSelected).filter(([k, v]) => v == true)
    )[0];
    this.formulaText = this.formulaTexts[this.formulaName];
    this.formula = this.formulas[this.formulaName];

    this.root = this.randChoice(this.notes);
    this.rootSelect = this.randChoice(this.root.split("\n"));
    this.rootText = this.rootSelect + this.formulaText;

    this.expectedNotes = new Array(12).fill(0);
    this.formula.forEach(
      (element) =>
        (this.expectedNotes[
          (this.notes.indexOf(this.root) + this.intervals.indexOf(element)) % 12
        ] = 1)
    );

    document.querySelector("#chord").innerText = this.rootText;
    document.querySelector("#formula").innerText = this.formula.join(" ");
  }

  isIncorrect() {
    var correctNotes = 0;
    var incorrectNotes = 0;
    for (let i = 0; i < 12; i++) {
      correctNotes += this.expectedNotes[i] && this.playedNotes[i];
    }
    for (let i = 0; i < 12; i++) {
      incorrectNotes += this.playedNotes[i] > 0;
    }
    incorrectNotes -= correctNotes;
    var res = incorrectNotes > 0;
    return res;
  }

  isCorrect() {
    var correctNotes = 0;
    for (let i = 0; i < 12; i++) {
      correctNotes += this.expectedNotes[i] && this.playedNotes[i];
    }
    var res = correctNotes == this.formula.length;
    return res;
  }

  checkNext() {
    return this.isIncorrect() || this.isCorrect();
  }

  playedNotesStr() {
    var str = [];
    this.playedNotes.forEach((element, index) => {
      if (element > 0) {
        str.push(this.notes[index].replace("\n", "/"));
      }
    });
    return str.join(" ");
  }

  updatePlayedNotes(midiData) {
    if (!this.paused) {
      var msgType = midiData[0];
      var msgNote = midiData[1];
      if (msgType == 144) {
        this.playedNotes[msgNote % 12] = 1;
      } else if (msgType == 128) {
        this.playedNotes[msgNote % 12] = 0;
      }
      for (let index = 1; index <= 12; index++) {
        if (this.playedNotes[index - 1]) {
          document
            .getElementById("note" + index)
            .setAttribute(
              "style",
              "fill:var(--primary-color);stroke:var(--background-color)"
            );
        } else {
          document
            .getElementById("note" + index)
            .setAttribute(
              "style",
              "fill:var(--gray-color);stroke:var(--background-color)"
            );
        }
      }
    }
  }

  selectChord(e) {
    this.formulaSelected[e] = !this.formulaSelected[e];
    console.log(20 + this.formulaSelected[e] * 80);
    document.querySelector("#select_" + e).style.opacity =
      0.2 + this.formulaSelected[e] * 0.8;
  }
}

var miditeach = new Miditeach();
var paused = false;
var start = Date.now();
var times = [];
var devices = [];

function loop(timestamp) {
  var next = miditeach.checkNext() && !paused;
  document.querySelector("#notes").innerText = miditeach.playedNotesStr(
    miditeach.playedNotes
  );

  if (next) {
    var delta = Date.now() - start;
    times.push(delta);
    var mean = (times.reduce((a, b) => a + b, 0) / times.length || 0) / 1000;
    document.querySelector("#lastTime").innerText = (delta / 1000).toFixed(2);
    document.querySelector("#meanTime").innerText = mean.toFixed(2);
    if (miditeach.isCorrect()) {
      document.querySelector("#chord").style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--correct-color");
      document.querySelector("#footer").style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--correct-color");
      miditeach.totalCorrect += 1;
      document.querySelector("#correct").innerText = miditeach.totalCorrect;
    } else {
      document.querySelector("#chord").style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--wrong-color");
      document.querySelector("#footer").style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--wrong-color");
      miditeach.totalIncorrect += 1;
      document.querySelector("#wrong").innerText = miditeach.totalIncorrect;
    }
    console.log("paused.");
    paused = true;
    setTimeout(function () {
      console.log("unpaused");
      paused = false;
      miditeach.sampleNextChord();
      start = Date.now();
      document.querySelector("#chord").style.color = document
        .querySelector("#footer")
        .style.getPropertyValue("--primary-color");
      document.querySelector("#footer").style.background = document
        .querySelector("#footer")
        .style.getPropertyValue("--secondary-color");
    }, 1000);
  }
  window.requestAnimationFrame(loop);
}


navigator.requestMIDIAccess().then((access) => {
  const inputs = access.inputs;

  access.inputs.forEach(function (input) {
    devices.push(input.name);
  });
  document.querySelector("#devices").innerText =
    "Deviced detected : " + devices.join(", ");

  inputs.forEach((midiInput) => {
    midiInput.onmidimessage = function (message) {
      miditeach.updatePlayedNotes(message.data);
    };
  });
});

window.requestAnimationFrame(loop);
