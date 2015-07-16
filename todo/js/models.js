var TodoViewModel = (function () {
    var model = function (settings) {


        var self = this;
        var callbacks = settings;
        this.todos = [];
        this.addTodo = function (evt) {
            evt.preventDefault();
            var todo = new TodoItemViewModel(self.todo.id, self.todo.task, self.todo.completed);
            // self.todos.push(todo);
            callbacks.onadd.apply(todo);
            self.todo.reset();
        };
        this.removeTodo = function (evt) {
            evt.preventDefault();
            var todo = this;
            callbacks.ondelete.apply(todo);
            //  if (index >= 0) self.todos.splice(index, 1);
        };
        this.todo = new TodoItemViewModel();
    }
    return model;
})();

var TodoItemViewModel = (function () {
    var model = function (id, task, completed) {
        this.id = id || new Date();
        this.task = task || "";
        this.completed = completed || false;
        this.reset = function () {
            this.completed = false;
            this.task = "";
            this.id = new Date();
        };
    };
    return model;
})();