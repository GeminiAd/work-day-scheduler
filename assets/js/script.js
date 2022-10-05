/* The moment that represents the current time. */
var currentDateTimeMoment;

/* jQuery Object that references the HTML Element in which the date and time is displayed. */
var currentDateTimeElement;

/* 
 *  This is an array of strings representing the scheduler text that the user has saved. A non-empty string in position 0 means the user has
 *  saved schedule text for the 9AM-10AM block, a non-empty string in position 1 means the user has saved schedule text for the 10AM-11AM block, etc.
 *  Whenever the timeblocks get rendered on the page, the text area is set to a value in this array, so this array must be set before the time blocks
 *  are rendered.
 */
var scheduleText;

function createEmptySchedule() {
    scheduleText = ["", "", "", "", "", "", "", "", ""];
}

/* 
 *  Initialization of the current date and time goes here.
 *  Since we have to check for any schedule text that the user may have saved for the day, this function must be called before any other function.
 */
function initializeDateTimeText() {
    currentDateTimeMoment = moment()
    currentDateTimeElement = $("#currentDay");

    console.log(currentDateTimeMoment);

    updateDateTimeText();

    startTime();
}

/*
 *  Generates each timeblock row and appends it to the element with the class of container, effectively rendering it on screen.
 *  This function needs to be called once per day. As I use the moment functions isAfter and isBetween to style the text boxes, the
 *  day/month/year has to be the same as the current day. This function also assumes that the div container is empty, so if this
 *  function is to be called again, the container div needs to be emptied.
 * 
 *  In order to generate the time blocks, I have to:
 *      1. Create an array that represents the hours in our work day scheduler. I'm including one extra hour - 6PM - as I'm using the moment
 *         function isBetween to see if we are in between two hours, so at hour 5 I need to compare if we are in between 5 and 6.
 *      2. Create the moments that correspond to each time block segment.
 *      3. For each moment except the last one (for reasons stated above), we have to:
 *          a. Create a div with the class of row.
 *          b. Create a label with the hour and AM/PM, and then append it to our row.
 *          c. Create a text area.
 *              i.      If the current time is before the hour that we are looking at, style the text area as future.
 *              ii.     If the current time is after the hour we are looking at and before the next hour, style the text as current.
 *              iii.    Otherwise, style the text as past.
 *          d. Set the text of the text area to any values we have saved, append the text area to the row element.
 *          e. Create a save button, add a save icon to it, attach a listener on click to save it, and append the save button to the row.
 *          f. Append the row to the container element.
 */
function initializeTimeBlocks() {
    /* 1. Create an array that represents the hours in our work day scheduler. */
    var hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    /* 2. Create the moments that correspond to each time block segment. */
    var hourMoments = [];
    for (var i = 0; i < hours.length; i++) {
        var momentToAdd = new moment();
        momentToAdd.hour(hours[i]);
        momentToAdd.minute(0);
        momentToAdd.second(0);
        momentToAdd.millisecond(0);

        hourMoments.push(momentToAdd)
    }

    /* 3. For each moment except the last one (for reasons stated above), we have to: */
    for (var i = 0; i < hourMoments.length-1; i++) {
        /* 3. a. Create a div with the class of row. */
        var row = $("<div>");
        row.addClass("row");

        /* 3. b. Create a label with the hour and AM/PM, and then append it to our row. */
        var hour = $("<label>");
        hour.addClass("hour p-3 text-right col-lg-1");
        hour.text(hourMoments[i].format("hA"));
        
        row.append(hour);

        /* 3. c. Create a text area. */
        var textArea = $("<textarea>");
        textArea.addClass("col-lg-10");

        /* 3. a. i. If the current time is before the hour that we are looking at, style the text area as future. */
        if (currentDateTimeMoment.isBefore(hourMoments[i])) {
            textArea.addClass("future");
        } 
        /* 3. a. ii. If the current time is after the hour we are looking at and before the next hour, style the text as current. */
        else if (currentDateTimeMoment.isBetween(hourMoments[i], hourMoments[i+1], "[)")) {
            textArea.addClass("present");
        } 
        /* 3. a. iii. Otherwise, style the text as past.. */
        else {
            textArea.addClass("past");
        }

        /* 3. d. Set the text of the text area to any values we have saved, append the text area to the row element. */
        textArea.text(scheduleText[i]);

        row.append(textArea);

        /* 3. e. Create a save button, add a save icon to it, attach a listener on click to save it, and append the save button to the row. */
        var saveButton = $("<button>");
        saveButton.addClass("saveBtn col-lg-1");
        saveButton.attr("index", i);
        
        var saveIcon = $("<i>");
        saveIcon.addClass("far fa-save");
        saveButton.append(saveIcon);

        saveButton.on("click", saveOnClick);

        row.append(saveButton);

        /* 3. f. Append the row to the container element. */
        $(".container").append(row);
    }
}

/*
 *  This function loads any schedule data the user may have saved. When the user saves any data - or schedules something for a block of time -
 *  the scheduler saves two values: the day the value was saved (in the form of a moment), and a list of strings. The string in the first position,
 *  or 0 index, corresponds to scheduling something at 9AM, the next string corresponds to scheduling something at 10AM, etc.
 *  When we load data we must:
 *      1. See if there is any data saved already. If there isn't, create an empty schedule.
 *      2. If there is data, check to see if it is the same day as today.
 *      2. a. If the data is from a different day, create an empty schedule.
 *      2. b. If the data is from the same day, load the saved values into scheduleText.
 *  
 */
function loadSavedSchedule() {
    /* 1. See if there is any data saved already. If there isn't, create an empty schedule. */
    var stringifiedSavedMoment = localStorage.getItem("scheduleDate");
    var stringifiedSavedScheduleText = localStorage.getItem("scheduleText");

    if (!stringifiedSavedMoment) {
        createEmptySchedule();
    } else {
        /* 2. If there is data, check to see if it is the same day as today. */
        var savedMoment = moment(JSON.parse(stringifiedSavedMoment));

        /* 2. a. If the data is from a different day, create an empty schedule. */
        if (!savedMoment.isSame(currentDateTimeMoment, "day")) {
            createEmptySchedule();
        }
        /* 2. b. If the data is from the same day, load the saved values into scheduleText. */
        else {
            var savedScheduleText = JSON.parse(stringifiedSavedScheduleText);
            scheduleText = savedScheduleText;
        }
    }
}

/* Starts time incrementing so that if the time updates the hour that we are on, the scheduler updates as well. */
function startTime() {
    var timeInterval = setInterval(function() {
        currentDateTimeMoment.add(1, "s");
        updateDateTimeText();
    }, 1000);
}

function updateDateTimeText() {
    currentDateTimeElement.text(currentDateTimeMoment.format("dddd, MMMM Do, YYYY   HH:mm:ss"));
}

/*
 *  Logic for when the save button is clicked.
 *  When the save button is clicked we need to:
 *      1. Get the text from the save area to save.
 *      2. Get the index in scheduleText that this text is saved to.
 *      3. Set the text in scheduleText that corresponds to this time block equal to the input text.
 *      4. Save to local storage.
 */
function saveOnClick(event) {
    
    var saveButton;

    if ($(event.target).is("i")) {
        saveButton = $(event.target).parent();
    } else {
        saveButton = $(event.target);
    }

    /* 1. Get the text from the save area to save. */
    var saveTextArea = saveButton.parent().children("textarea").eq(0);
    var textToSave = saveTextArea.val();

    /* 2. Get the index in scheduleText that this text is saved to. */
    var index = parseInt(saveButton.attr("index"));
    
    /* 3. Set the text in scheduleText that corresponds to this time block equal to the input text. */
    scheduleText[index] = textToSave;

    /* 4. Save to local storage. */
    saveSchedule();
}

/*
 *  Saves the schedule.
 *  To save the schedule we need to:
 *      1. Save a moment corresponding to the day this schedule exists.
 *      2. Save the schedule text
 */
function saveSchedule() {
    /* 1. Save a moment corresponding to the day this schedule exists. */
    var momentToSave = moment();
    var stringifiedMoment = JSON.stringify(momentToSave);
    localStorage.setItem("scheduleDate", stringifiedMoment);

    /* 2. Save the schedule text. */
    var stringifiedScheduleText = JSON.stringify(scheduleText);
    localStorage.setItem("scheduleText", stringifiedScheduleText);
}

initializeDateTimeText();
loadSavedSchedule();
initializeTimeBlocks();