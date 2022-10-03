var currentDateMoment;
var currentDateElement;
var timeInterval;

/* Initialization stuff goes here */
function initializeDateTimeText() {
    currentDateMoment = moment()
    currentDateElement = $("#currentDay");

    updateDateTimeText();

    startTime();
}

function initializeTimeBlocks() {
    var row = $("<li class=\"row\">");
    console.log(row);
    $(".container").append(row);
}

/* Starts time incrementing so that if the time updates the hour that we are on, the scheduler updates as well. */
function startTime() {
    timeInterval = setInterval(function() {
        currentDateMoment.add(1, "s");
        updateDateTimeText();
    }, 1000);
}

function updateDateTimeText() {
    currentDateElement.text(currentDateMoment.format("dddd, MMMM Do, YYYY   HH:mm:ss"));
}

initializeDateTimeText();
initializeTimeBlocks();