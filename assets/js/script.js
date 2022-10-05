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

/* Checks the currentDateTimeMoment to see if we have just hit a new day. Returns true if it is a new day, false otherwise. */
function checkIfNewDay() {
    var hour = currentDateTimeMoment.hour();
    var minute = currentDateTimeMoment.minute();
    var second = currentDateTimeMoment.second();

    if ((hour === 0) && (minute===0) && (second===0)) {
        return true;
    } else {
        return false;
    }
}

/* Checks the currentDateTimeMoment to see if we have hit a new hour. Returns true if we have just hit a new hour, false otherwise. */
function checkIfNewHour() {
    var minute = currentDateTimeMoment.minute();
    var second = currentDateTimeMoment.second();

    if (minute === 0 && second === 0) {
        return true;
    } else {
        return false;
    }
}

function createEmptySchedule() {
    scheduleText = ["", "", "", "", "", "", "", "", ""];
}

/*
 *  Handles the situation where the user has the application open and the day switches.
 *  In this case, I would have to:
 *      1. Reset any work day schedule text that we have, as it is now invalid.
 *      2. We can save our schedule at this point, just to indicate there is no data for today yet.
 *      3. We want to remove all of the rows that are children of the div with class container.
 *      4. We want to use initializeTimeBlocks to regenerate the time blocks, only all the hours will be in the future.
 */
function handleDayChange() {
    /* 1. Reset any work day schedule text that we have, as it is now invalid. */
    resetSchedule();

    /* 2. We can save our schedule at this point, just to indicate there is no data for today yet. */
    saveSchedule();

    /* 3. We want to remove all of the rows that are children of the div with class container. */
    $(".container").children().remove();

    /* 4. We want to use initializeTimeBlocks to regenerate and render the time blocks, only all the hours will be in the future. */
    initializeTimeBlocks();
}

/*
 *  Handles the situation where the user has the application open and the hour switches. We only care if the hour switches to the hours of
 *  8AM, 9AM, 10AM, 11AM, 12PM, 1PM, 2PM, 3PM, 4PM, 5PM, and 6PM, as we have to update the color of the rows depending if the hour is current or past.
 *  
 *  In order to handle the hour change we have to:
 *      1. Get the hour, see if we are between 9AM and 6PM. If we're not, we can quit immediately.
 *      2. Otherwise, if the hour is 9AM, we just have to update the textarea in the 9AM row to be present.
 *      3. If we are at hour 18, we just have to update the timeblock corresponding to the previous hour to be in the past.
 *      4. If we are at hour 10, 11, 12, 13, 14, 15, 16, or 17, we have to update the time block of the current hour to be present, and the timeblock
 *         of the previous hour to be past.
 */
function handleHourChange() {
    /* 1. Get the hour, see if we are between 9AM and 6PM. If we're not, we can quit immediately. */
    var hour = currentDateTimeMoment.hour();

    if (hour < 9 || hour > 18) {
        return;
    }

    var textAreaToManipulate;

    /* 2. Otherwise, if the hour is 9AM, we just have to update the textarea in the 9AM row to be present from the future. */
    if (hour === 9) {
        textAreaToManipulate = $("#hour-"+hour);
        textAreaToManipulate.removeClass("future");
        textAreaToManipulate.addClass("present");
    } 
    /* 3. If we are at hour 18, we just have to update the timeblock corresponding to the previous hour to be in the past from the present. */
    else if (hour === 18) {
        textAreaToManipulate = $("#hour-"+hour-1);
        textAreaToManipulate.removeClass("present");
        textAreaToManipulate.addClass("past");
    }
    /*
     *  4. If we are at hour 10, 11, 12, 13, 14, 15, 16, or 17, we have to update the time block of the current hour to be present from future, 
     *     and the timeblock of the previous hour to be past from present.
     */
    else {
        textAreaToManipulate = $("#hour-"+hour);
        textAreaToManipulate.removeClass("future");
        textAreaToManipulate.addClass("present");

        textAreaToManipulate = $("#hour-"+hour-1);
        textAreaToManipulate.removeClass("present");
        textAreaToManipulate.addClass("past");
    }
}

/* 
 *  Initialization of the current date and time goes here.
 *  Since we have to check for any schedule text that the user may have saved for the day, this function must be called before any other function.
 */
function initializeDateTimeText() {
    currentDateTimeMoment = moment()
    currentDateTimeMoment.millisecond(0); // To keep things simple, I'm not going to worry about milliseconds.
    currentDateTimeElement = $("#currentDay");

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
        textArea.id = "hour-"+hours[i]; // Should give hour-9, hour-10, etc. as the IDs for easy selecting

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

/* Same as create empty schedule. */
function resetSchedule() {
    createEmptySchedule();
}

/* 
 *  Starts time incrementing so that if the time updates the hour that we are on, the scheduler updates as well.
 *  At each time interval we have to:
 *      1. Add one second to our moment representing the current date and time.
 *      2. Update the date/time text. This is only necessary as I am displaying the seconds for testing purposes.
 *      3. Check to see if it is a new day. If it is, we handle the day change.
 *      4. If it isn't a new day, check to see if it's a new hour. If it's a new hour, handle the new hour.
 */
function startTime() {
    var timeInterval = setInterval(function() {
        /* 1. Add one second to our moment representing the current date and time. */
        currentDateTimeMoment.add(1, "s");

        /* 2. Update the date/time text. This is only necessary as I am displaying the seconds for testing purposes. */
        updateDateTimeText();

        /* 3. Check to see if it is a new day. If it is, we handle the day change. */
        var isNewDay = checkIfNewDay();
        if (isNewDay) {
            handleDayChange();
        } else{
            /* 4. If it isn't a new day, check to see if it's a new hour. If it's a new hour, handle the new hour. */
            var isNewHour = checkIfNewHour();
            if (isNewHour) {
                handleHourChange();
            }
        }
    }, 1000);
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

    /* 
     *  This is an unintended consequence of event delegation: because I attached a listener on click to the save button, the icon
     *  will also respond to a click event. The following code checks to see if the icon was clicked and sets the save button
     *  accordingly, as I have information saved in the button about what index in scheduleText the saved text should be assigned to.
     */
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
 *      2. Save the schedule text.
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

function updateDateTimeText() {
    currentDateTimeElement.text(currentDateTimeMoment.format("dddd, MMMM Do, YYYY   HH:mm:ss"));
}

initializeDateTimeText();
loadSavedSchedule();
initializeTimeBlocks();