app.js

The app.js library is a simple Javascript library for creating interactive web pages or web apps using only Javascript. It abstracts HTML into functions to allow a document to be defined declaratively using javascript. In addition, it has a simple model to allow for how the document is created.

# Getting Started

To use app.js, create your app in a separate javascript file and serve it along with app.html and app.js by a method of your choice.  The [express-modular-server](https://github.com/michael-ts/express-modular-server) module [service-app](https://github.com/michael-ts/service-app) creates an endpoint /app which extends to URL to include the name of the app to run followed by any arguments, if applicable.  You can also serve your app from a web server like Apache or even run it directly from the file:// protocol.

In this section we will show how to create a "Hello World" app and show how it can be served in several different ways.

## Create the web app

First, create a webapp named hello.  To do so, create a file with the module name, a dot, and "js", e.g. "hello.js" containing a function called hello_init.  This function will be called to initialize the web app.  Note that the name consists of the name of our module, an underscore, and "init".  We will clear the background color, and call the paragraph function, P, to create our message.  We will create a second paragraph to display any arguments passed to the webapp.

Note that we pass an object with a key $$ and a value doc which is an alias for the document body.  This key sets the parent node for the newly created element - if you do not set the parent the element will still be returned, but it will not be attached to the document.

hello.js:

```javascript
function hello_init() {
    doc.style.background=""
    P("Hello, world!",{$$:doc})
    P(Array.prototype.slice.call(arguments).join(","),{$$:doc})
}

```
## Serving webapp from an agnostic web server

Copy your webapp (e.g. hello.js) along with the webapp-app files (app.html, app.js, and compat.js) to the same directory on your server - this will be the directory that the web server will serve your files from.

Access your webapp using a URL that looks like this:

https://www.yourWebDomain.com/path-to-app-files/app.html?arg3+arg4#appname/arg1/arg2

In this case *appname* is "hello" and we can experiment with passing different arguments to see how argument passing works.

## Serving webapp from the file:// protocol

When serving via the file:// protocol it is necessary, as it is when serving from an agnostic web server, to put all the files for the webapp (your files along with the webapp-app files) in the same directory.  Then access your webapp using an URL that looks like this:

file:///path-to-app-files/app.html?arg3+arg4#appname/arg1/arg2

Note: When serving from the file:// protocol, your webapp will be limited in what it can do by restrictions the web browser places on code running from this protocol.

## Serving webapp from express-modular-server

This is the recommended approach, as it will allow you to manage your entire project, both front end and back end files, using a single package manager, namely npm.

First, you will need to set up your web server using express-modular-server, add service-app to your dependency list at the top level, and activate the API as you start the server.  For instance, your minimal server code would look like this:

```javascript
require("express-modular-server")({
    http:true
}).API("app").start()
```

Next, create an npm module for your webapp.  **Be sure its name starts with "webapp-" or service-app will not find it**!  If your webapp depends on other webapps it can list them as its dependencies.  Add your webapp to the dependencies of your server to ensure that it is installed.   Now when you install your server package, it will automatically pull in your webapp.  The service-app module automatically uses a search algorithm *at startup* to locate all webapps you have installed so it can serve them when requested.  It will look in the *node_modules* directory of every module whose name starts with "webapp-" starting at the current directory and in all ancestor directories and use each file that is not named "package.json" or "README.md".  If a file is found in multiple directories, only the last will be used.

Once your server is running, you can access your webapp using an URL that looks like this:

http://www.yourWebDomain.com/app/appname/arg1/arg2?arg3+arg4

In this case our *appname* is "hello" and we can experiment with passing arguments or not.

# Element Functions

The primary use of app.js is to construct a document.  An HTML document is composed of elements.  Each element supported by app.js has a constructor function which matches the HTML tag of the element, with the case of the function name modified to use CamelCase to separate words.  So for instance, HR remains all upper-case since it stands for "Horizontal Rule" but BR becomes "Br" as it stands for "Break".

All element functions return a reference to a DOM element (HTML, SVG, etc.).

All element functions take arbitrary parameters which can be any of the following.  Parameters are processed in the order they are passed, either to add sub-elements or set attributes of the element.

* A string parameter is converted into text nodes, separated by BR elements whenever a newline occurs in the string.

* An array parameter is processed sequentially as if its contents had appeared directly as arguments instead of the array.

* A reference to a DOM element is appended as a child to the element being constructed at the point where it appears in the argument list.

* An object parameter is treated as attributes and properties to be added to the element.  Each key is added as both a property and attribute with the value of that key in the object.

The following HTML tags have corresponding element functions:

* A

* B

* Br

* Button

* Canvas

* Col

* ColGroup

* Div

* Em

* Font

* H1 through H6

* HR

* I

* Img

* Input

* LI

* Meta

* OL

* Option

* P

* Pre

* Progress

* Section

* Select

* Span

* Strike

* Strong

* Table

* TBody

* TD

* TextArea

* TFoot

* TH

* THead

* TR

* TT

* U

* UL

* Video

**Examples:**

`P("This is a",B("test"),".")`

creates the following HTML:

&lt;P&gt;This is a&lt;B&gt;test&lt;/B&gt;.&lt;/P&gt;

Span("Red",{id:"color",style:{"border":"1px solid black"}})

creates the following HTML:

&lt;SPAN id="color" style="border:1px solid black;"&gt;Red&lt;/SPAN&gt;

# $ Functions

All functions that start with a dollar sign ($)  take either a string, which is interpreted to be the id of the element to be considered, or a reference to the object itself.

* `$id(id)`  returns a reference to the object with the specified string id. If the id parameter is already an object, returns that directly.

* `$del(id)` deletes the object with the specified id. 

* `$replace(old,newob)` replaces the old node with the new node

* `$attr(id,attrs)`  give the specified object the given attributes, or retrieve the specified attribute. 
The attrs parameter can be a string, in which case it is the attribute to retrieve and return. Otherwise, it is expected to be an object containing key:value pairs, where the key is the name of the attribute to set, and value is the value to set the attribute to. A value of "null" removes the specified attribute. Except for the special pseudo-attributes listed below, the attribute is set both in the object itself, and in the underlying HTML. Except for the style attribute, which can be an object containing key:value pairs for each sub-style, the value is assigned literally.

    * $$, $parent: makes the object the (last) child of the specified node

    * $a, $after: makes the object the next sibling of the specified node

    * $b, $before: makes the object the previous sibling of the specified node

* `$add(parent,ob)` adds text, a DOM object, or a set of attributes to the given object.

    * If ob is a string, it is treated as text, and newlines are converted to line break (BR) tags.

    * If ob i	s an array, each element in turn is added as if it had been the sole ob parameter.

    * If ob i	s an HTML element, text element, or SVG element, it is appended to the parent.

    * If ob is an object, they are treated as attributes to add as if $attr had been called

* `$after(elem1, elem2)` Inserts or moves elem2 to become the next sibling of elem1 in the document.

* `$before(elem1, elem2)` Inserts or moves elem1 to become the previous sibling of elem2 in the document.

* `$parent(parent, child)` Make child be the last child of parent, or remove from DOM if no parent

* `$first(parent, child)` make child be the first child of parent, or remove from DOM if no parent

* `$index(elem)` returns the index of the element in its parent

* `$value(ob,value)` Gets (if value is omitted) or sets the value of the object.  This function is intended to abstract away the different ways of values being represented in different types of user-interface elements.  The follow elements are supported:

    * INPUT elements

    * TEXTAREA elements

    * BUTTON elements

    * Any element which has a property ValueGet which is a function returning the value of the element, and a property ValueSet which is a function taking the value to set the element to

* `$index(ob)` returns the child number (zero numbered) of the element in its parent element.

# Pseudo-Elements

The app.js library abstracts the concept of document elements via Pseudo-elements.  A Pseudo-element is a representation of an element in a pure javascript object with no dependencies on the environment.  This allows it to be used in environments that lack a document in which elements can be rendered, such as node.js.  The app.js library will automatically detect when its environment cannot render a document and will automatically use Pseudo-elements for all element functions.  (Note that while constructing new elements works, some other operations are not supported or implemented, such as most dollar functions.)

## Functions

* PseudoElementMarkup(pseudoelem) - returns the markup string for the passed pseudo-element (created by app.js)

* UsePseudoElement(flag) - if the flag is true, subsequent calls to Element Functions will return pseudo-elements.  If the flag is false, and a document rendering environment is present, calls to Element Functions will return actual native elements.

# Web App Functions

The following functions are life-cycle functions.  The app.js framework parses the arguments in the URL, determines the name of the web app to run, and recursively loads all dependencies, initializing them from the bottom up.

Any app.js compliant app must define these functions as needed.  All of these functions are based on the name of the javascript source file.  Below, *MODULE* represents the name of the current javascript source file (excluding the dot and extension).

* *MODULE*_requires()
Optional.  Must return either be a string or an array of strings.  Each string is the name of a module (the relative or absolute URL of the javascript file, omitting the dot and extension (which must be "js" at the end of the name).  All modules returned will be loaded unless an error occurs during loaded.

* *MODULE*_init(app)
Optional.  Initialization function, called once all dependencies of the module has been loaded. First argument is the name of the web app that is being loaded.  The typical use of this argument is to check if the current module is the top-level web app, and if so, to call element function to construct and initialize the document and/or user interface.

* *MODULE*_css()
Optional. Must return either a string or array of strings.  This function is like *FILE*_requires, except for css.  The string(s) returned must specify a relative or absolute URL, omitting the dot and "css" extension.

The app_loaded function, if it exists, is called after app.js has initialized everything.

Although discouraged, if external code is needed which cannot be accommodated by the normal app.js dependency mechanism, CSS and javascript can be loaded asynchronously:

* cssload(source,callback) - loads the CSS specified by specified source file (which must omit the trailing dot and "css") and then call the callback.

* js(module, callback) - loads the javascript source file specified by the given module (which excludes the dot and file extension, which must be js), and calls the callback when it has been loaded and initialized.

In addition, CSS can be applied to the document directly via javascript:

* css(selector) - returns a CSS style object for the given selector.  Altering this object directly alters the CSS and therefore the rendering of the document

Besides the web-app functions, app.js also:

* Catches the delete and backspace key, and if either of them results in a navigation event (e.g. the browser wants to go back to the previous page as if the back button had been hit) a dialog box is presented asking the user if they really want to leave the page.  This prevents accidental data loss if these keys are inadvertently hit at the wrong time.

# Event Handlers

app.js provides a mechanism to serialize event handlers.  To do so requires that all event handlers be defined in terms of function names which are held as strings in the appropriate element attributes.  The following special attribute is used:

* on*<event>*list - this attribute must be a comma separated list of function names.  When the event *<event>* fires, each function is called in turn with the first parameter being the element on which the event fired, and the second parameter being the event object.

It is not necessary to use the app.js event handling mechanism, however this mechanism is automatically used when constructing user input elements (Input, Select, TextArea, Button) in order to implement proper response of the $value function.  All of these use the *onchange* event, and Button also uses *onkeydown*, *onkeyup*, *onmousedown*, *onmouseup*, and *onclick* so be aware that if you alter these handlers it may interfere with this functionality.

# Utilities

The follow utility functions are available:

CursorPosGet(element) - returns the position of the cursor in the specified element

CursorPosSet(element, pos) - sets the position of the cursor in the specified element

SelectionClear() - clears any selection

The compat.js file provides a few utility polyfills. Of note:

String.prototype.times - allows you to do things like "string".times(3) to get a new string with the specified string repeated the given number of times.

isNumber(str) - returns true if the argument is a number, or is a string that contains exactly a valid parseable number.

# Cross-environment compatibility

The app.js library also does some things to make using it and modules based on it easy to use in non-browser environments such as node.js.  First, when app.js is *require*d, it returns a loader function.  Passing a module name (possibly prepended with a path to that module) loads it using the app.js loading mechanism, namely, recursively loading all javascript dependencies and the *init* function for each module once all its dependencies are loaded.  (CSS dependencies are not currently loaded, as this doesnâ€™t make sense in a server environment.) Each app.js module must call Register as part of its initialization for this function to work properly.

The app.js library provides the following functions for app.js modules to call in order to facilitate being loaded outside a browser:

* Global(function,...) - exports all arguments (which must be function references to named functions) as global variables.  The app.js library uses this to expose its own relevant functions, but it is available to other modules as well.  This is intended to provide a uniform experience between browsers and node.js of making all Element functions (and supported $ functions) visible without needing any prefix (which would distract from the constructionâ€™s appearance as it would deviate from looking like straight HTML/SVG tags). 

* Register(*module*, init, requires) accepts a module object (the caller should pass the *module* variable) and returns the same variable with its exports set to an object containing two keys: *init* and *requires* with the same values passed respectively to this function.  The caller must then assign the return value back to *module*.  The app.js library uses this to properly recurse app.js module dependencies and call the proper init functions as each module is ready.

Note: The app.js library defines *module* as *false* if it is not defined in order to allow this call to work (as a no-op) outside the node.js / CommonJS environment.
