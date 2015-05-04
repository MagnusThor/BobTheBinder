#BobJS version 0.2

Yet another MVVM framework - Bob The Binder is a tiny JavaScript framework for Model-View-View-Model that mainly is designed for real time applications. Awesome or super - heroic ?  No, it just reduces the list of things you have to worry about.

##Data-binding

Declarative data-binding using Bob is a intuitive way of keeping the view and model syncronized. This is awesome because it minimizes DOM manipulation from the list of things you have to worry about. It doesnt matter if the model or the view changes, Bob makes sure it works both ways!


##Native JavaScript

Unlike many other frameworks, there is no need to inherit from roprietary types in order to wrap the model in accessors methods. Bob expects plain vanilla JavaScript objects. This makes your code easy to maintain,reuse, and attach or de-attach from Bob.

##How does it work?

This is the most simple example.

###JavaScript    


    var ViewModel = function () {
        this.item = {
            name: "John Doe",
            age: 40,
        }
    };

    var vm = new ViewModel();

    $(function() {
        Bob.apply(Bob.binders).bind($("#app"), vm);
    });

###html

    <div id="app">
        <p>
            The value if item.name is 
            '<mark data-bind="text:item.name"></mark>'
        </p>
        <div>
            <label>Name:</label>
            <input type="text" data-bind="value:item.name" />
        </div>
    </div>

##More basic examples 

More examples can be found at the following url 

http://magnusthor.github.io/BobTheBinder/

##Documentation

Right now the documentation is in progress, as we still are working on the "**Notifiers**" , a feature of Bob that simplifies and gives the opportunity to easily add bi-directional-data-synchronizations in real-time this not the main focus at the moment.

##Todo app

Yes, of coz' there will be an **Todo app** example available soon :-)

