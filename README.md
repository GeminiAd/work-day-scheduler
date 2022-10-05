# Work Day Scheduler

<https://geminiad.github.io/work-day-scheduler>

------------------------------------------------------

![Work Day Scheduler Demo](./assets/images/work-day-scheduler.gif)

<a href="#description">Description</a> •
<a href="#key-features">Key Features</a> •
<a href="#usage">Usage</a> •
<a href="#technologies-used">Technologies Used</a> •
<a href="#concepts-demonstrated">Concepts Demonstrated</a> •
<a href="#credits">Credits</a> •
<a href="#author">Author</a>

## Description

This is just a simple work day application. The date and time are showed at the top of the screen within the header. There are nine time blocks - one for 9AM, 10AM, 11AM, 12PM, 1PM, 2PM, 3PM, 4PM, and 5PM. Each block is colored according to whether or not we are within that block of time. If a block is in the past, it's colored grey, if we are presently within the block, it's colored red, and if a block is in the future, it's colored green. If you have a task that you want to scheduled for a particular time block, you can enter some text in the text area for that time block and hit the save icon. If you close the app and reopen it on the same day that you saved the task, the task is still there to remind you of a particular task. The save icon only saves the schedule for the particular time block it's attached to, so if wrote tasks for 9AM, 10AM, and 11AM, but only clicked the 11AM button, only the task in the 11AM time block will be saved. Note that these tasks are only valid for the particular day that they are created; when you open up this application the next day, all tasks in each time block is reset.

## Key Features

- Keep track of your schedule for the day.
- Color coded so you know what tasks have passed, what task you are currently on, and what tasks are in the future.
- Boasts a responsive design. Looks good on dektop, tablet, and mobile.

## Usage

Navigate to: <https://geminiad.github.io/work-day-scheduler>

Enter a task in the text area for a time block and hit the save button! That task will be saved for the rest of the day.

## Technologies Used

- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)
- [FontAwesome Icons](https://fontawesome.com/)
- JavaScript
- CSS
- HTML

## Concepts Demonstrated

- The importing and use of third-party APIs in JavaScript.
- General HTML/CSS/JavaScript syntax and purpose.
- Setting and stopping JavaScript timers using setInterval().
- Handling JavaScript events.
- Adding and removing HTML elements on demand using the DOM.
- Storing and retrieving data on local storage for persistence between sessions.

## Credits

Manuel Nunes for a mockup of the site and a small amount of starter code.

## Author

Adam Ferro
- [Github](https://github.com/GeminiAd)
- [Linked-In](https://www.linkedin.com/in/adam-ferro)