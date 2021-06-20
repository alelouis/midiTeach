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
    };
    this.sampleNextChord();
  }

  randChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  sampleNextChord() {
    this.playedNotes = new Array(12).fill(0);

    this.formulaName = this.randChoice(Object.keys(this.formulas));
    this.formula = this.formulas[this.formulaName];

    this.root = this.randChoice(this.notes);
    this.rootSelect = this.randChoice(this.root.split("\n"));
    this.rootText = this.rootSelect + this.formulaName;

    this.expectedNotes = new Array(12).fill(0);
    this.formula.forEach(
      (element) =>
        (this.expectedNotes[
          (this.notes.indexOf(this.root) + this.intervals.indexOf(element)) % 12
        ] = 1)
    );

    document.querySelector("#chord").innerText = this.rootText;
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
    if (this.isIncorrect() || this.isCorrect()) {
      this.totalChords += 1;
      if (this.isCorrect()) {
        console.log("Correct");
        this.totalCorrect += 1;
      } else {
        console.log("Wrong");
        this.totalIncorrect += 1;
      }
      this.sampleNextChord();
    }
  }

  playedNotesStr() {
    var str = [];
    this.playedNotes.forEach((element, index) => {
      if (element > 0) {
        str.push(this.notes[index].replace("\n", "/"));
      }
    });
    return str;
  }

  updatePlayedNotes(midiData) {
    if (!this.paused){
      var msgType = midiData[0];
      var msgNote = midiData[1];
      if (msgType == 144) {
        this.playedNotes[msgNote % 12] = 1;
      } else if (msgType == 128) {
        this.playedNotes[msgNote % 12] = 0;
      }
      document.querySelector("#notes").innerText = this.playedNotesStr(
        this.playedNotes
      );
    }
  }
}

var miditeach = new Miditeach();

navigator.requestMIDIAccess().then((access) => {
  const inputs = access.inputs;
  inputs.forEach((midiInput) => {
    midiInput.onmidimessage = function (message) {
      miditeach.updatePlayedNotes(message.data);
      miditeach.checkNext();
    };
  });
});
