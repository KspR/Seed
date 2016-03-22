## Seedjs : fast, light and simple JavaScript Class and Evented Object
------------------------------------------------------
Seedjs is a simple inheritable and event-driven Class that allows you to do elegant OOP.
If you include [toDOM](https://github.com/KspR/toDOM) too you can bind DOM elements to Seed.

### When to use?
Event-driven architecture will help reduce the coupling between different modules of your application. Inheritance will help for maintenance and readability of the code.

### Installing Seedjs
Just include Seed.js somewhere in your < body > and you are ready to go!

If you want to use Seed's View capability, you will have to include [toDOM](https://github.com/KspR/toDOM) too.

```html
<script src="http://raw.githubusercontent.com/KspR/Seedjs/master/Seed.js"></script>
```

### Usage
#### Basics
```javascript
var MyClass = r.Seed.extend({
  
  init : function(options) { // called at instanciation
    console.log('init');
  }

});

new MyClass({
  some : 'options'
}); // will log 'init'
```

#### Inheritance
```javascript
var MySubClass = MyClass.extend({
  
  '-init' : function(options) { // this will be called before the herited init method
    console.log('before init');
  },

  '+init' : function(options) { // this will be called after the herited init method
    console.log('after init');
  }

});

var instance = new MySubClass; // will log 'before init', 'init', 'after init' 
```

#### Publish/Subscribe
```javascript
var subscription = instance.on('foo', function() {
  console.log('bar');
});

instance.fire('foo'); // will log 'bar'
subscription.un(); // un stands for unsubscribe, I find unsubscribe too hard to type :D!
instance.fire('foo'); // will do nothing
```

#### Views
You will need to include [toDOM](https://github.com/KspR/toDOM) for this usage.
```javascript
var instance = new Seed.extend({
  tpl : { // tpl stands for template, you can pass anything that toDOM can take!
    tag : 'div Click me!',
    events : {
      click : function() {
        instance.fire('click');
      }
    }
  },

  '+init' : function() {
    document.body.appendChild(this.el);
  }
});

instance.on('click', function() {
  console.log('yay!');
});
```

### About

#### Who uses sandjs ?
* [wallDraft](http://walldraft.com) (collaborative real-time whiteboard)

#### Authors 
* [Pierre Colle](https://github.com/piercus)
* [Sam Ton That](https://github.com/KspR)
