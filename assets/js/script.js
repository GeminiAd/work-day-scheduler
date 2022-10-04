var currentDateTimeMoment;
var currentDateTimeElement;
var timeInterval;

/* Initialization stuff goes here */
function initializeDateTimeText() {
    currentDateTimeMoment = moment()
    currentDateTimeElement = $("#currentDay");

    updateDateTimeText();

    startTime();
}

function initializeTimeBlocks() {
    var hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    var hourMoments = [];
    for (var i = 0; i < hours.length; i++) {
        var momentToAdd = new moment(currentDateTimeMoment);
        momentToAdd.hour(hours[i]);
        momentToAdd.minute(0);
        momentToAdd.second(0);
        momentToAdd.millisecond(0);

        hourMoments.push(momentToAdd)
    }

    for (var i = 0; i < hourMoments.length-1; i++) {
        var row = $("<div>");
        row.addClass("row");

        var hour = $("<label>");
        hour.addClass("hour p-3 text-right col-lg-1");
        hour.text(hourMoments[i].format("hA"));
        
        row.append(hour);

        var textArea = $("<textarea>");
        textArea.addClass("col-lg-10");

        if (currentDateTimeMoment.isBefore(hourMoments[i])) {
            textArea.addClass("future");
        } else if (currentDateTimeMoment.isBetween(hourMoments[i], hourMoments[i+1], "[)")) {
            textArea.addClass("present");
        } else {
            textArea.addClass("past");
        }

        row.append(textArea);

        var saveButton = $("<button>");
        saveButton.addClass("saveBtn col-lg-1");
        
        var saveIcon = $("<i>");
        saveIcon.addClass("far fa-save");
        saveButton.append(saveIcon);

        row.append(saveButton);

        $(".container").append(row);
    }
}

/* Starts time incrementing so that if the time updates the hour that we are on, the scheduler updates as well. */
function startTime() {
    timeInterval = setInterval(function() {
        currentDateTimeMoment.add(1, "s");
        updateDateTimeText();
    }, 1000);
}

function updateDateTimeText() {
    currentDateTimeElement.text(currentDateTimeMoment.format("dddd, MMMM Do, YYYY   HH:mm:ss"));
}

initializeDateTimeText();
initializeTimeBlocks();