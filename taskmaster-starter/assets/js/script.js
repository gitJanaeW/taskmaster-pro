var tasks = {};

var createTask = function(taskText, taskDate, taskList) { // I don't get what taskList does
  var taskLi = $("<li>").addClass("list-group-item"); // List item
  var taskSpan = $("<span>") // The date badge pill (span)
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>") // The task name (p)
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li + append to ul list on the page
  taskLi.append(taskSpan, taskP);
  $("#list-" + taskList).append(taskLi);
};

// USE THE BELOW AS REFERENCE FOR LOCAL STORAGE IN YOUR NEXT PROJECT
var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }
  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function(){
  // Trim the white space off of this object
  var trim = $(this) // "this" refers to the "p" since any dynamic element is considered an object
    .text()
    .trim();
    // Create a new textarea element and replace the p with the textarea
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(trim)
    .trigger("focus");
  $(this).replaceWith(textInput);
  console.log(this);
});

$(".list-group").on("blur", "textarea", function(){ // blur is the opposite of focus
  // text = whatever is in textarea but trimmed
  var text = $(this)
    .val()
    .trim();
  // get the parent ul's id attribute and take out the "list-" part in it
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get this li's position in the list of other li elements (an index number value)
  var index = $(this)
    .closest(".list-group-item")
    .index(); // Index grabs the index of this li child element
  
  tasks[status][index].text = text;
  
  saveTasks();

  // recreate the p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  // replace textarea with p
  $(this).replaceWith(taskP);
});

// make lists sortable by connecting everything ".card .list-group" class to
// every other class of the same name (ie. the lists can sort amongst themselves)
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false, // If true, this would allow text with a width wider than the card to be scrolled through (horizontally)
  tolerance: "pointer", // "pointer" requires a div click to sort. "intersect" requires a click on the left of the div to sort
  helper: "clone", // Clones the element being dragged which is necessary to prevent click events from accidentally triggering on the original element
  activate: function(event){
    console.log("activate", this); // Triggers when activation starts
  },
  deactivate: function(event){
    console.log("deactivate", this); // Triggers when activation stops
  },
  over: function(event){
    console.log("over", event.target); // Triggers when an item enters a list
  },
  out: function(event){
    console.log("out", event.target); // Triggers when an item leaves a list
  },
  update: function(event){ // OFFICE HOURS: Ask how/why this body of code works. "this" might be part of the confusion
    var tempArr = [];
    $(this).children().each(function(){
      var text = $(this)
        .find("p") // .find() is similar to .children() except that .find() can search through ALL descendant elements, not just children
        .text()
        .trim();
      var date = $(this)
        .find("span")
        .text()
        .trim();

      tempArr.push({
        text: text,
        date: date
      });

      console.log(tempArr);
    });
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
  
    tasks[arrName] = tempArr;
    saveTasks();
  }
});
// when trash is dropped
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){ // ui refers to the object being dragged
    console.log("UI HERE: ", ui)
    console.log("ui.draggable", ui.draggable);
    ui.draggable.remove(); // The .draggable key is within ui and contains the DOM li of the dragged object
  },
  over: function(event, ui){
    console.log("OVER");
  },
  out: function(event, ui){
    console.log("OUT");
  }
});
// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() { // What is "show.bs.modal"?
  // clear values
  $("#modalTaskDescription, #modalDueDate").val(""); // Empty modal input fields
});
// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() { // What is "shown.bs.modal"?
  $("#modalTaskDescription").trigger("focus"); // Autofocus on the text box
});
// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val(); // The modal task box
  var taskDate = $("#modalDueDate").val(); // The modal date box

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");
    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});
// edit due date
$(".list-group").on("click", "span", function(){
  // get the current value of date span
  var date = $(this)
    .text()
    .trim();
  // create new input element and autofocus on it
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date)
    .trigger("focus");
  // swap out elements
  $(this).replaceWith(dateInput);
});
// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// click out of due date change
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();
  // get the parent ul's id attribute and take out the "list-" part in it
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the li's index position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});


// load tasks for the first time
loadTasks();


