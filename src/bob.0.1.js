var $ = $ ||
function (selector, el) {
    if (!el) el = document;
    var args = arguments;
    if (args.length === 0) return el;
    if (typeof (arguments[0]) === "function") {
        el.addEventListener("DOMContentLoaded", function (e) {
            args[0].call(this, e);
        });
        return el;
    }
    return el.querySelector(selector);
};
var Bob = Bob || {};


var getExpression = function (data) {
    var prop = data.split(".").first();
    var args = prop.match(/\((.*?)\)/);
    // is a function , remove the arguments...
    if (args) prop = prop.replace(args[0], '');
    var expr = prop.replace(/[()]/g, '');
    expr = expr.replace(/\[(\w+)\]/g, '.$1');
    expr = expr.replace(/^\./, '');
    return {
        prop: expr,
        args: args,
        isFn: args === null ? false : true,
      
    }
}

Bob.serializeForm = function (form) {
    if (!form) form = this;
    var data, i, len, node, ref;
    data = {};
    ref = form.elements;
    for (i = 0, len = ref.length; i < len; i++) {
        node = ref[i];
        if (!node.disabled && node.name) {
            data[node.name] = node.value;
        }
    }
    return data;
};
Bob.binders = {
    registerBinder: function (name, binder) {
        if(this.hasOwnProperty(name))
            this[name] = binder;
        return this;
    },
    hide: function (node, onchange) {
        return {
            updateProperty: function (value) {
                if (value) {
                    node.style.display = "";
                } else {
                    node.style.display = "none";
                }
            }
        }
    },
    css: function (node) {
        var previous;
        return {
            updateProperty: function (newValue) {
            
                if (typeof (newValue) === "function") {
                    newValue = newValue();
                }
               ;
                if (!newValue) return;
                if (previous) {
                    previous.split(",").forEach(function (c) {
                        node.classList.remove(c);
                    });
                } else {
                    newValue.split(",").forEach(function (c) {
                        node.classList.remove(c);
                    });
                }
                node.classList.add(newValue);
                previous = newValue;
            }
        }
    },
    value: function (node, onchange) {
        node.addEventListener('keyup', function () {
            onchange(node.value);
        });
        return {
            updateProperty: function (value) {
                if (value !== node.value) {
                    node.value = value;
                }
            }
        };
    },
    count: function (node) {
        return {
            updateProperty: function (value) {
                    node.textContent = String(value).length;
            }
        };
    },
    html: function (node) {
        return {
            updateProperty: function (value) {
                node.htmlText = value;
            }
        };
    },
    text: function (node) {
        return {
            updateProperty: function (text) {
                node.textContent = text;
            }
        };
    },
    selectchange: function(node, onchange) {
        return {
            updateProperty: function (value, b, data) {
                var listener = function (e) {
                    var options = e.target.querySelectorAll("option:checked");
                    var match = [];
                    for (var i = 0; i < options.length; i++) {
                       
                        match.push(data[options[i].index]);
                    }
                    onchange(match,node.dataset.with);

                }
                node.addEventListener('change', listener);
            }
        }
    },
    select: function (node) {
        return {
            updateProperty: function () {

                var args = arguments;


                if (Array.isArray(args[2])) {
                    var values = args[2];


                    var match = values.findIndex(function (a) {
                        return JSON.stringify(a) == JSON.stringify(args[3]);
                    });
                    if (!match) node.selected = true;
                } else {
                    var value = args[0];
                    if (!node.value) return;
                    if (value == node.value) {

                        node.selected = true;
                    } else {
                        node.selected = false;
                    }

                }
            }
        }
    },
    checkchange: function (node, onchange) {
        var previous;
        return {
            updateProperty: function () {

                var args = arguments;
                var listener = function (e) {

                    if (typeof (args[0]) === "boolean") {
                        onchange(node.checked, node.dataset.wite);
                    } else

                        onchange(args[0], node.dataset.with, node.checked);

                }
                if (previous) {
                    node.removeEventListener("click", previous);
                }
                previous = listener;

                node.addEventListener('change', listener);
            }
        }
    },
    checked: function (node, onchange, object) {
     
     
        return {
            updateProperty: function () {
                var args = arguments;
                if (typeof (args[0]) === "object") {
                    var current = args[3];
                    current.forEach(function (c) {
                        node.checked = JSON.stringify(c) === JSON.stringify(args[0]);
                    });
                    return;
                }
                if (args[0]) {
                    node.checked = true;
                } else {
                    node.checked = false;
                }
            }
        }
    },
    click: function (node) {
        var previous;
        var data;
     
        return {
            updateProperty: function (fn) {
                if (!data) data = this;
              
                var listener = function (e) {
                    fn.apply(data, [e]);
                };
                if (previous) {
                    node.removeEventListener("click", previous);
                }
                previous = listener;
                node.addEventListener('click', listener);
            }
        };
    },
};


Bob.Notifier = (function () {
    var ctor = function () {
        var self = this;
        this.notifiers = [];
        this.on = function (mutator, fn, cb) {
            var n;
            var exists = self.notifiers.findBy(function (p) {
                return p.name == mutator;
            });
            if (exists.length == 0)
                n = {
                    name: mutator,
                    fn: fn,
                    ts: new Date()
                };
            self.notifiers.push(n);
            if (cb) {
                cb.apply(n, [n]);
            }
            return this;

        }
        this.off = function (mutator, cb) {
            var exists = self.notifiers.findBy(function (p) {
                return p.name == mutator;
            });

        };
    };
    return ctor;
})();


Bob.apply = function (binders) {
    var $root;


    var notifier = new Bob.Notifier();

    
   

    function findObservable(obj, path,parent) {
        if (path === "$this") {
            return obj;
        }
        var parts = path.split(".");
        var meta = getExpression(parts[0]);

        var root = (new RegExp("^\\$root")).test(meta.prop);

        if (root) {
            return findObservable($root, parts.slice(1).join("."),path);
        }
        if (parts.length == 1) {
            if (meta.isFn) {
                var fnResult = (obj[meta.prop]).apply(obj, meta.args[1].split(","));
                return fnResult;
            }

            if (Array.isArray(obj[meta.prop])) {
                return obj[meta.prop];
            }
            if ((typeof (obj[meta.prop]) === "object")) {
                  return obj[meta.prop];
              } else {
                  return obj;
              }
        }
        if (meta.isFn) {
            return findObservable((obj[meta.prop]).apply(obj, meta.args[1].split(",")), parts.slice(1).join("."),path);
        } else {
            return findObservable(obj[meta.prop], parts.slice(1).join("."),path);
        }
    };

    function bindObject(node, binderName, object, propertyName) {
        var objectToObserve =  findObservable(object, propertyName);
        var context;
        if (node.dataset.attr) {
            bindAttributes(node, objectToObserve);
        }

        // is there a notifier for the object?



        var updateValue = function (newValue, parent) {




            var args = arguments;
            if (!parent) {
                parent = propertyName;
            }
            if (!objectToObserve.hasOwnProperty(parent.split(".").pop())) {
                var locatedObject = findObservable(object, parent);
                if (Array.isArray(newValue) && Array.isArray(locatedObject)) {
                    var inter = locatedObject.intersect(newValue);


                    inter.map(function(is) {
                        var remove = locatedObject.findIndex(function (t) {
                            return JSON.stringify(t) === JSON.stringify(is); // todo: should take care of arguemts[2] true/false
                        });
                        if (remove > -1);
                    
                        locatedObject.remove(remove);

                      
                    });
                  
                    newValue.map(function (a, b) {

                        var arr = locatedObject.findIndex(function (t) {
                          
                            return JSON.stringify(t) === JSON.stringify(a);// todo: should take care of arguemts[2] true/false
                        });
                        if (arr > -1) {
                           // console.log("the el existed");
                            //locatedObject[arr] = a;
                        } else {
                            
                            locatedObject.push(a);
                        }
                    });
                } else if (Array.isArray(newValue) && !Array.isArray(locatedObject)) {
                    locatedObject[parent.split(".").pop()] = newValue[0][parent.split(".").pop()];
                } else if
                    (!Array.isArray(newValue) && Array.isArray(locatedObject)) {
                    if (typeof (args[2]) === "boolean") {
                        var exists = locatedObject.findIndex(function (l) {
                            return JSON.stringify(l) === JSON.stringify(newValue);
                        });
                        if (args[2]) {
                           
                            if (exists == -1) locatedObject.push(newValue);
                        } else {
                            locatedObject.remove(exists);
                        }
                    }
                } else {
                    objectToObserve[parent.split(".").pop()] = newValue;
                }
                return;
            }
            objectToObserve[parent.split(".").pop()] = newValue;
        };
        var binder = binders[binderName](node, updateValue, object);
       

       

        // todo: refactor
        var r = propertyName.split(".").pop();
        r = r.replace("(", "").replace(")", "");
        if (node.dataset.with) {
            context = findObservable($root, node.dataset.with);
           
        }


      
        var toObserve = objectToObserve.hasOwnProperty(r) ? objectToObserve[r] : objectToObserve;

       // console.log(object);


        binder.updateProperty.apply(object, [toObserve, binderName, objectToObserve, context || object]);

        var observer = function (changes) {

          
         


            var changed = changes.some(function (change) {
                return change.name === propertyName.split(".").pop();
            });
            if (changed) {
               
                binder.updateProperty(objectToObserve[r], binderName, objectToObserve);
            }
            if (typeof (objectToObserve[r]) === "function" && !changed) {
                binder.updateProperty(objectToObserve[r], binderName, objectToObserve);
            }
        };

        try {
            Object.observe(objectToObserve, observer);
        } catch (e) {

        } 
       

        return {
            unobserve: function() {
                Object.unobserve(objectToObserve, observer);
            },
            observe: function() {
                Object.observe(objectToObserve, observer);
            }
        };
    };

    function bindAttributes(node, object) {
        if (typeof(object) !== "object") return;
        var bindItem = function(element) {
            var attributes = node.dataset.attr.split(",");
            attributes.forEach(function(attr) {
                var parts = attr.split(":");
                switch (parts[0]) {
                case "innerText":
                    element.textContent = object[parts[1]];
                    break;
                    case "selected":
                     
                        var o = findObservable($root, parts[1]);
                        if (Array.isArray(o)) {
                            o.forEach(function(a) {
                                if (JSON.stringify(a) === JSON.stringify(object))
                                    node.selected = true;
                            });
                        } else 
                            if (o == node.value) node.selected = true;
                      
                       
                  
                    break;;
                default:
                    element.setAttribute(parts[0], object[parts[1]]);
                }
            });
            var model = bindModel(node, object);
            return model;
        };
        var updateItem = function(element, update) {
            var attributes = node.dataset.attr.split(",");
            attributes.forEach(function(attr) {
                var parts = attr.split(":");
                if (parts[0] === "text") {
                    element.textContent = update[parts[1]];
                } else {
                    var r = parts[1].split(".").pop();
                    if (r)
                        r = r.replace("(", "").replace(")", "");
                    var isFn = typeof (object[r]) === "function";
                    element.setAttribute(parts[0], isFn ? object[r]() : object[parts[1].split(".").pop()]);
                }
            });
            var model = bindModel(node, update);
            return model;
        }
        bindItem(node);
        var observer = function(changes) {
            updateItem(node, changes[0].object);
        };

        Object.observe(object, observer);
        return {
            unobserve: function() {
                Object.unobserve(object, observer);
            },
            observe: function() {
                Object.observe(object, observer);
            }
        };
    }
    function bindOptions(node, array) {
        var capture = function (original) {
            var cloned = original.cloneNode(true);
            original.parentNode.removeChild(original);
            return {
                insert: function () {
                    var newNode = cloned.cloneNode(true);
                    node.appendChild(newNode);
                    return newNode;
                }
            };
        }
        delete node.dataset.options;
        var bindItem = function (obj) {
            var option = captured.insert();
            var model = bindModel(option, obj, array);
            return model;
        };
        var captured = capture(node.firstElementChild);
        var bindings = array.map(function (a) {
            return bindItem(a);
        });

        var observer = function(a) {
          // do op
        };
        Object.observe(array, observer);
    }

    function bindCollection(node, array) {
        function capture(original) {
            var before = original.previousSibling;
            var parent = original.parentNode;
            var cloned = original.cloneNode(true);
            original.parentNode.removeChild(original);
            return {
                insert: function () {
                    var newNode = cloned.cloneNode(true);
                    parent.insertBefore(newNode, before);
                    return newNode;
                }
            };
        }
        node.dataset.parent = node.dataset.repeat;

        delete node.dataset.repeat;

        var parent = node.parentNode;
        var captured = capture(node);
        var bindItem = function (element) {
           
            var newEl = captured.insert();
           
            var model = bindModel(newEl, element,array);
            if (node.dataset.attr) {
                bindAttributes(newEl, element);
            }
            return model;
        };

        var bindings = array.map(function (a) {
          
            return bindItem(a);
        });

        //var observer = function (changes) {
        //    console.log(changes);

        //    changes.forEach(function(change) {
        //        if (change.addedCount > 0) {
        //            console.log("!");
        //            bindings.push(bindItem(array[change.index]));
        //        }
        //        if (change.removed) {
        //            child = parent.children[change.index];
        //            if(child)
        //            child.parentNode.removeChild(child);
        //        }
        //    });
        //};

        var observer = function (changes) {
            changes.forEach(function (change) {
                var index = parseInt(change.name, 10), child;
                if (isNaN(index)) return;
                if (change.type === 'add') {
                    bindings.push(bindItem(array[index]));
                } else if (change.type === 'update') {
                    bindings[index].unobserve();
                    bindModel(parent.children[index], array[index]);
                } else if (change.type === 'delete') {
                    bindings.pop().unobserve();
                    child = parent.children[index];
                    child.parentNode.removeChild(child);
                }
            });
        };

        Object.observe(array, observer);

        return {
            unobserve: function() {
                Object.unobserve(array, observer);
            },
            observe: function() {
                Object.observe(object, observer);
            }
        };
    }

    var registredNotifiers = [];


    function bindModel(container, object) {

       

        if (notifier) {
            var nfs = notifier.notifiers.map(function (n) {
                if (registredNotifiers.findBy(function(pre) {
                    return pre === n.name;
                }).length === 0) {
                    var no = findObservable(object, n.name);
                    Object.observe(no, function (changes) {

                        changes.forEach(function (change) {
                            n.ts = new Date();
                            n.fn.apply(n, [change]);
                        });

                    });
                    registredNotifiers.push(n.name);
                };
                return n.name;
            });
        }

        if (!$root) $root = object;
    
        function isDirectNested(node) {
            node = node.parentElement;
            while (node) {
                if (node.dataset.repeat ) {
                    return false;
                }
                node = node.parentElement;
            }
            return true;
        }

        function onlyDirectNested(selector) {
            var collection = container.querySelectorAll(selector);
            var arr = Array.prototype.filter.call(collection, isDirectNested);
            return arr;
        }

        var bindings = onlyDirectNested('[data-bind]').map(function (node) {
            var datasets = node.dataset.bind;
            datasets.split(",").forEach(function(dataset) {
                var binderName = dataset.substr(0, dataset.indexOf(":"));
                var binderProp = dataset.substr(binderName.length + 1, dataset.length);
                bindObject(node, binderName, object, binderProp);
            });
        }).concat(onlyDirectNested('[data-repeat]').map(function(node) {
            var d = findObservable(object, node.dataset.repeat);
            return bindCollection(node, d);

        })).concat(onlyDirectNested('[data-options]').map(function (node) {
            var d = findObservable(object, node.dataset.options);
            return bindOptions(node, d);
        })).concat([container].map(function(node) {
            var datasets = node.dataset.bind;
            if (!datasets) return;
            datasets.split(",").forEach(function (dataset) {
                var binderName = dataset.substr(0, dataset.indexOf(":"));
                var binderProp = dataset.substr(binderName.length + 1, dataset.length);
                bindObject(node, binderName, object, binderProp);
            });
        }));
        return {
            unobserve: function() {
                bindings.forEach(function(binding) {
                    if (binding) binding.unobserve();
                });
            },
            observe: function() {
                bindings.forEach(function(binding) {
                    binding.observe();
                });
            }
        };
    }

    return {
        notifier:notifier,
        bind: bindModel,
        $root: function() {
            return $root;
        },
    };
};


Array.prototype.intersect = function(array) {
    var result = [];

    var a = this.slice(0);
    var b = array.slice(0);
    var aLast = a.length - 1;
    var bLast = b.length - 1;
    while (aLast >= 0 && bLast >= 0) {
        if (a[aLast] > b[bLast]) {
            a.pop();
            aLast--;
        } else if (a[aLast] < b[bLast]) {
            b.pop();
            bLast--;
        } else {
            result.push(a.pop());
            b.pop();
            aLast--;
            bLast--;
        }
    }
    return result;
};
Array.prototype.first = function (num) {
    if (!num) return this[0];
    if (num < 0) num = 0;
    return this.slice(0, num);
};
Array.prototype.take = function (num) {
    if (!num) num = 2;

    return (this.filter(function (t, i) {
        if (i < num) return t;

    }) || []);

};
Array.prototype.findBy = function (pre) {
    var arr = this;
    var result = [];
    for (var i = 0; i < arr.length; i++) {

        if (pre(arr[i]))
            result.push(arr[i]);


    };
    return result;
};
Array.prototype.count = function(pre) {
    var arr = this;
    var result = 0;
    if (!pre) return this.length;

    for (var i = 0; i < this.length; i++) {
        if (pre(arr[i])) {
            result++;
        }
    }
    return result;
};
Array.prototype.findIndex = function (pre) {
    var arr = this;

    for (var i = 0; i < this.length; i++) {
        if (pre(arr[i])) {
            return i;
        }
    }
    return -1;
};
Array.prototype.remove = function (index) {
    this.splice(index, 1);
    return this.length;
};
Array.prototype.clone = function() {
    return this.slice(0);
};
Array.prototype.removeAll = function () {
    
    for (var i = 0; this.length;i++) {
        this.splice(i, 1);
    }
    
    return this.length;
};


