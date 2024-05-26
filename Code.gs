// Should be sorted ascending by timestamp
var DATA_SHEET = "Test Data 2";
var WRITE_SHEET = "Test Actual 2";
var WORKSHOPS = {
  "Prayer - Jon Lo": 20,
  "Why Four Gospels? - Jason Lee": 20,
  "Christian Worldview - Ray Zhang": 20,
  "A Reasonable Faith - Joe Yu": 20,
  "Whose Will Will You Follow: A Plan For Your Future - Christian Tiao": 20,
  "QFL Praise Team Q&A": 20,
}

/** Inserts a custom menu when the spreadsheet opens. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Scripts')
      .addItem('Assign Workshops', 'assignWorkshops')
      .addToUi();
}

function assignWorkshops() {
  let app = SpreadsheetApp.getActive();
  let inputSheet = app.getSheetByName(DATA_SHEET);
  let inputRange = inputSheet.getDataRange();

  let formEntries = parseEntries(inputRange.getValues());
  let workshopAssignments = createAssignmentsMap();

  for (let e of formEntries) {
    assignKid(e, workshopAssignments);
  }

  writeAssignments(workshopAssignments, app.getSheetByName(WRITE_SHEET));
}

/** Parse input sheet's values into FormEntries. */
function parseEntries(inputRangeValues) {
  let entries = [];
  for (let i = 1;i < inputRangeValues.length;i++) {
    let cur = inputRangeValues[i];
    entries.push(new FormEntry(cur[1], cur[2], cur[3], cur[4], cur[5]));
  }
  return entries;
}

/** Create an empty assignments mapping. */
function createAssignmentsMap() {
  let assignments = {}
  for (let name in WORKSHOPS) {
    assignments[name] = []
  }
  assignments["UNABLE TO ASSIGN"] = []
  return assignments;
}

/** Assign a kid to a workshop. */
function assignKid(entry, assignments) {
  for (let workshopChoice of entry.choices) {
    if (isFull(workshopChoice, assignments)) {
      continue;
    }
    assignments[workshopChoice].push(`${entry.name} (${entry.smallGroup})`);
    return;
  }
  assignments["UNABLE TO ASSIGN"].push(`${entry.name} (${entry.smallGroup})`);
}

/** Check if a workshop is full. */
function isFull(workshopName, assignments) {
  return assignments[workshopName].length >= WORKSHOPS[workshopName];
}

/** Write workshop assignments to output sheet. */
function writeAssignments(assignments, outputSheet) {
  let cells = [Object.keys(assignments)];
  let longestLength = getLongestLength(assignments);

  for (let rowNum = 0;rowNum < longestLength;rowNum++) {
    let row = [];
    for (let name in assignments) {
      let cell = assignments[name].length > rowNum ? assignments[name][rowNum] : "";
      row.push(cell);
    }
    cells.push(row);
  }

  let outputRange = outputSheet.getRange(`A1:G${cells.length}`);
  outputRange.setValues(cells);
}

/** Get the length of the workshop with the most assignments. */
function getLongestLength(assignments) {
  let longestLength = 0;
  for (let key in assignments) {
    longestLength = Math.max(assignments[key].length, longestLength);
  }
  return longestLength;
}

class FormEntry {
  constructor(name, smallGroup, firstC, secondC, thirdC) {
    this.name = name;
    this.smallGroup = smallGroup;
    this.choices = [firstC, secondC, thirdC];
  }
}

