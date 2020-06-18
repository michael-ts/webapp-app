var app_version = "1.5.5"

// ============================================================================
// $ Functions
// ============================================================================
function $id(xz) {
    return (typeof xz == "string") ? document.getElementById(xz) : xz
}

// make elem2 be the next sibling of elem1
function $after(elem1,elem2) {
    if (typeof elem1 == "string") elem1 = document.getElementById(elem1)
    if (typeof elem2 == "string") elem2 = document.getElementById(elem2)
    if (!elem1 || !elem2) return
    if (elem1.nextSibling) {
	elem1.parentNode.insertBefore(elem2,elem1.nextSibling);
    } else {
	elem1.parentNode.appendChild(elem2)
    }
    return elem1
}

// make elem1 be the previous sibling of elem2
function $before(elem1,elem2) {
    if (typeof elem1 == "string") elem1 = document.getElementById(elem1)
    if (typeof elem2 == "string") elem2 = document.getElementById(elem2)
    if (!elem1 || !elem2) return
    elem2.parentNode.insertBefore(elem1,elem2)
    return elem1
}

function $index(xxx){
    var i=0
    if (typeof xxx == "string") xxx = document.getElementById(xxx)
    if (!xxx) return
    return Array.prototype.indexOf.call(xxx.parentNode.childNodes, xxx)
}

// replace old object in DOM with newob, giving it the same id as old object
// old object retains its id, since as it is no longer in the DOM this is ok
// unlike other $ functions, returns a reference to the new object instead
// of the first argument as the new object is the only DOM attached Element.
function $replace(old,newob) {
    var id
    if (typeof old == "string") {
	id = old
	old = $id(old)
    } else if (old) id = old.id
    if (typeof newob == "string") newob = document.getElementById(newob)
    if (old==newob) return old
    if (old) {
	old.parentNode.replaceChild(newob,old)
    }
    newob.id=id
    return newob
}

function $first(parent,child) {
    if (typeof parent == "string") parent = document.getElementById(parent)
    if (typeof child == "string") child = document.getElementById(child)
    if (parent.firstChild) {
        parent.insertBefore(child,parent.firstChild)
    } else {
        parent.appendChild(child)
    }
}

// return element from parent and return it
function $del(xz) {
    if (typeof xz == "string") xz = document.getElementById(xz)
    if (xz && xz.parentNode) {
	xz.parentNode.removeChild(xz)
    }
    return xz
}

function $value(xz,val) {
    xz = (typeof xz == "string") ? document.getElementById(xz) : xz
    if (typeof val == "undefined") {
	if (typeof xz.ValueGet == "function") {
	    return xz.ValueGet()
	} else if (xz.tagName == "INPUT" && xz.type == "checkbox") {
	    return xz.checked
	} else if ("value" in xz) {
	    return xz.value  // at least for TEXTAREA
	} else return xz.textContent
    } else {
	if (typeof xz.ValueSet == "function") {
	    return xz.ValueSet(val)
	} else if (xz.tagName == "TEXTAREA") {
	    xz.textContent = val
	    xz.setAttribute("value",val)
	    xz.value = val
	} else if ("value" in xz) {
	    xz.setAttribute("value",val)
	    xz.value = val
	} else {
	    xz.textContent = val
	}
	if (xz.tagName == "INPUT" && xz.type == "checkbox") {
	    xz.defaultChecked = val
	    xz.checked = val
	}
    }
}

function $attr_parent(xz,val) {
    var parent = val
    if (typeof parent == "string") {
	parent = document.getElementById(parent)
    }
    if (parent) {
	parent.appendChild(xz)
    } else if (xz.parentNode) {
	xz.parentNode.removeChild(xz)
    }
}

function $attr_after(xz,val) {
    var sibling = val
    if (typeof sibling == "string") {
	sibling = document.getElementById(sibling)
    }
    if (sibling.nextSibling) {
	sibling.parentNode.insertBefore(xz,sibling.nextSibling)
    } else {
	sibling.parentNode.appendChild(xz)
    }
}

function $attr_before(xz,val) {
    var sibling = val
    if (typeof sibling == "string") {
	sibling = document.getElementById(sibling)
    }
    sibling.parentNode.insertBefore(xz,sibling)
}

function $attr_style(xz,val) {
    var j
    for (j in val) {
	xz.style[j] = val[j]
    }
}

function $attr_text(xz,val) {
    xz.textContent = val
}

var $attr_special = {
    "$parent":$attr_parent,
    "$$":$attr_parent,
    "$after":$attr_after,
    "$a":$attr_after,
    "$before":$attr_before,
    "$b":$attr_before,
    "style":$attr_style,
    "$text":$attr_text
}

function $attr(xz,attrs) {
    xz = (typeof xz == "string") ? document.getElementById(xz) : xz
    if (!xz) return xz
    if (typeof attrs == "string") {
	return xz.getAttribute(attrs) // apparently can't get special attributes atm
    }
    var i
    for (i in attrs) {
	if (i in $attr_special) {
	    $attr_special[i](xz,attrs[i])
	} else if (attrs[i] === null) {
	    xz.removeAttribute(i) // we apparently can't uset special attributes atm
	} else {
	    xz.setAttribute(i,attrs[i])
	}
    }
}

// add arbitrary text, DOM objects, object encoded set of attributes to Element
function $add(xz) {
    if (typeof xz == "string") xz = document.getElementById(xz)
    var argn
    for (argn=1;argn<arguments.length;argn++) {
	if (typeof arguments[argn] == "string"
	    || typeof arguments[argn] == "number") {
	    var text = arguments[argn]
	    if (typeof text != "string") text = ""+text
	    var ii,texts
	    if (xz.tagName == "TEXTAREA") {
		texts = [ text ]
	    } else texts = text.split("\n")
	    for (ii=0;ii<texts.length;ii++) {
		if (texts[ii] != "") {
		    xz.appendChild(_TextElement(texts[ii]))
		}
		if (ii+1 < texts.length) {
		    xz.appendChild(_BrElement())
		}
	    }
	} else if (typeof arguments[argn] == "object" && arguments[argn] !== null) {
	    if ((isDoc && arguments[argn] instanceof HTMLElement)
		|| arguments[argn].nodeType == 3
		|| (hasSVG && arguments[argn] instanceof SVGElement)
		|| (typeof Node != "undefined"
		    && arguments[argn] instanceof Node
		    && arguments[argn].nodeType == 8) // comment
	       ) {
		xz.appendChild(arguments[argn])
	    } else if (arguments[argn] instanceof Array
		       || (isDoc && arguments[argn] instanceof NodeList)
		       || (isDoc && arguments[argn] instanceof HTMLCollection)
		       || (arguments[argn].hasOwnProperty("length")
			   && typeof arguments[argn].length === "number")) {
		var i
		for (i=0;i<arguments[argn].length;i++) {
		    $add(xz,arguments[argn][i])
		}
	    } else {
		//if ("$f" in arguments[argn]) {
		//    var deps = arguments[argn].deps
		//    if (typeof deps == "string") deps = [ deps ]
		//    xz.appendChild($dep(Span(),deps,arguments[argn].$f))
		//} else {
		$attr(xz,arguments[argn])
		//}
	    }
	}
    }
    return xz
}

// ============================================================================
// Pseudo-Elements
// ============================================================================
var MustUsePseudoElements = true
var HTMLDefaultParent
function UsePseudoElements(flag) {
    if (MustUsePseudoElements) flag = true
    isDoc = !flag
    if (isDoc) {
	_HTMLElement = function _HTMLElement(tag) {
	    var ret =  document.createElement(tag)
	    if (HTMLDefaultParent) $add(HTMLDefaultParent,ret)
	    return ret
	}
	_TextElement = function _TextElement(txt) {
	    var ret = document.createTextNode(txt)
	    if (HTMLDefaultParent) $add(HTMLDefaultParent,ret)
	    return ret
	}
	_BrElement = function _BrElement() {
	    var ret=document.createElement("br")
	    if (HTMLDefaultParent) $add(HTMLDefaultParent,ret)	    
	    return ret
	}
    } else {
	isDoc = false
	_HTMLElement = _PseudoElement
	_TextElement = function _TextElement(txt) { return txt }
	_BrElement = function _BrElement() { return "\n" }
    }
}

var _HMTLElement, _TextElement, _BrElement, isDoc, hasSVG
hasSVG = (typeof SVGElement != "undefined")
if (typeof document == "object"
    && typeof Document == "function"
    && document instanceof Document
    && typeof HTMLElement == "function"
    && typeof Node == "function"
    && typeof NodeList == "function"
    && typeof HTMLCollection == "function") {
    MustUsePseudoElements = false    
    UsePseudoElements(false)
} else {
    MustUsePseudoElements = true
    UsePseudoElements(true)
}

function _PseudoElement(tag,ob) {
    if (!ob) ob = { }
    ob.tagName = tag
    ob.setAttribute = function(name,val) {
	if (val === undefined) return this[name]
	this[name]=val
    }
    ob.removeAttribute = function(name) {
	delete this[name]
    }
    ob.style = { }
    ob.childNodes = [ ]
    ob.nodeType = 3 // so $add will use appendChild
    ob.appendChild = function(node) {
	ob.childNodes.push(node)
    }
    // adding text will fail here because we try to create a text node and brs for newlines
    return ob
}

// convert upper-case characters into a dash plus the lowercase
function CSSStyleNameFromKey(name) {
    var in1 = name.split("")
    var i, out = [ ]
    for (i=0;i<in1.length;i++) {
	if (in1[i].toLowerCase() != in1[i]) {
	    out.push("-"+in1[i].toLowerCase())
	} else out.push(in1[i])
    }
    return out.join("")
}

function PseudoElementMarkup(ob) {
    var i
    if (typeof ob == "string") return ob
    if (!ob.tagName) return ob.textContent
    var txt = [ "<"+ob.tagName ], j
    for (i in ob) {
	if (i == "nodeType") continue
	if (i == "tagName") continue
	if (i == "childNodes") continue
	if (i == "style") {
	    var j
	    txt.push('style="')
	    for (j in ob[i]) {
		txt.push(CSSStyleNameFromKey(j)+":"+ob[i][j]+";")
	    }
	    txt.push('"')
	    continue
	}
	if (ob.hasOwnProperty(i) && typeof(ob[i]) != "function") {
	    txt.push(i+'="'+ob[i]+'"')
	}
    }
    txt.push(">")
    for (i=0;i<ob.childNodes.length;i++) {
	txt.push(PseudoElementMarkup(ob.childNodes[i]))
    }
    txt.push("</"+ob.tagName+">")
    return txt.join(" ")
}


// ============================================================================
// Element Functions
// ============================================================================

// A({href:"..."},"link text")
function A() {
    return $add(_HTMLElement("a"),arguments)
}

function B() {
    return $add(_HTMLElement("b"),arguments)
}
function Br() {
    return $add(_HTMLElement("br"),arguments)
}
function Canvas() {
    return $add(_HTMLElement("canvas"),arguments)
}
function Col() {
    return $add(_HTMLElement("col"),arguments)
}
function ColGroup() {
    return $add(_HTMLElement("colgroup"),arguments)
}
function Div(ob) {
    return $add(_HTMLElement("div"),arguments)
}

function Em() {
    return $add(_HTMLElement("em"),arguments)
}
// Font({color:"...",fontFace:"...",fontSize:xxx},"...")
function Font() {
    return $add(_HTMLElement("font"),arguments)
}
function H1() {
    return $add(_HTMLElement("h1"),arguments)
}
function H2() {
    return $add(_HTMLElement("h2"),arguments)
}
function H3() {
    return $add(_HTMLElement("h3"),arguments)
}
function H4() {
    return $add(_HTMLElement("h4"),arguments)
}
function H5() {
    return $add(_HTMLElement("h5"),arguments)
}
function H6() {
    return $add(_HTMLElement("h6"),arguments)
}
function HR() {
    return $add(_HTMLElement("hr"),arguments)
}
function I() {
    return $add(_HTMLElement("i"),arguments)
}
// Img({src:url})
function Img() {
    return $add(_HTMLElement("img"),arguments)
}
function LI() {
    return $add(_HTMLElement("li"),arguments)
}
function Meta() {
    return $add(_HTMLElement("meta"),arguments)
}
function OL() {
    return $add(_HTMLElement("ol"),arguments)
}
function Option() {
    return $add(_HTMLElement("option"),arguments)
}
function P() {
    return $add(_HTMLElement("p"),arguments)
}
function Pre() {
    return $add(_HTMLElement("pre"),arguments)
}
function Progress() {
    return $add(_HTMLElement("progress"),arguments)
}
function Section() {
    return $add(_HTMLElement("section"),arguments)
}
function Span() {
    return $add(_HTMLElement("span"),arguments)
}
function Strike() {
    return $add(_HTMLElement("strike"),arguments)
}
function Strong() {
    return $add(_HTMLElement("strong"),arguments)
}
function Table() {
    return $add(_HTMLElement("table"),arguments)
}
function TBody() {
    return $add(_HTMLElement("tbody"),arguments)
}
function TD() {
    return $add(_HTMLElement("td"),arguments)
}
function TFoot() {
    return $add(_HTMLElement("tfoot"),arguments)
}
function TH() {
    return $add(_HTMLElement("th"),arguments)
}
function THead() {
    return $add(_HTMLElement("thead"),arguments)
}
function TR() {
    return $add(_HTMLElement("tr"),arguments)
}
function TT() {
    return $add(_HTMLElement("tt"),arguments)
}
function U() {
    return $add(_HTMLElement("u"),arguments)
}
function UL() {
    return $add(_HTMLElement("ul"),arguments)
}
function Video() {
    return $add(_HTMLElement("video"),arguments)
}

// maps node tagName to Element Function
var tagMap = {
    A:'A',
    B:'B',
    H:'H',
    I:'I',
    P:'P',
    U:'U',
    BUTTON:'Button',
    BR:'Br',
    CANVAS:'Canvas',
    CHECKBOX:'Checkbox',
    COL:'Col',
    COLGROUP:'ColGroup',
    DIV:'Div',
    EM:'Em',
    FONT:'Font',
    H1:'H1',
    H2:'H2',
    H3:'H3',
    H4:'H4',
    H5:'H5',
    H6:'H6',
    HR:'HR',
    IMG:'Img',
    INPUT:'Input',
    LI:'LI',
    OL:'OL',
    OPTION:'Option',
    PROGRESS:'Progress',
    PRE:'Pre',
    SCRIPT:'Script',
    SELECT:'Select',
    SPAN:'Span',
    STRONG:'Strong',
    STRIKE:'Strike',
    TABLE:'Table',
    TEXTAREA:'TextArea',
    TBODY:'TBody',
    TD:'TD',
    TFOOT:'TFoot',
    TH:'TH',
    THEAD:'THead',
    TR:'TR',
    UL:'UL',
    VIDEO:'Video',
}

var cssloaded={}
//app_prefix=""
function cssload(module,callback) {
    if (module in cssloaded) {
	if (callback) callback()
	return
    }
    cssloaded[module]=true
    var head = document.getElementsByTagName("head")[0]
    var links = document.getElementsByTagName("link")
    var i
    source = module+".css"

    for (i=0;i<links.length;i++) {
	var src = links[i].getAttribute("href")
	if (!src) continue
	var args = src.split("?")
	if (args[0] == source) break
    }
    if (i < links.length) {
	links[i].parentNode.removeChild(links[i])
    }
    var link=document.createElement("link")
    console.log('debug:'+('onload' in link))
    link.setAttribute("rel", "stylesheet")
    link.setAttribute("type", "text/css")
    var ac = app2cache ? "" : ("?anticache="+new Date().getTime())
    var href = app_prefix+source+ac
    link.setAttribute("href",href)
    console.log('css9:'+href)
    var called

    link.onload = function() {
	if (callback && !called) callback()
	called=true
    }
    var img = document.createElement('img')
    img.onerror = function(){
        if (callback && !called) callback()
	called=true
    }
    img.src = href
    head.appendChild(link)
}

var css
(function() {
    var max_hacks = 10
    var hack_delay = function hack_delay() {
	var t0 = new Date().getTime()
	var hack = new XMLHttpRequest()
	hack.open("GET", "dummy"+t0, false)
	hack.send()
	var t1 = new Date().getTime()
	console.log("hack delayed ",(t1-t0))
    }
    var css_valid = function css_valid(ss) {
	try {
	    if (!ss.cssRules) {
		return true
	    } else return true
	} catch(e) {
	    console.log(e)
	    if (e.code == 18) {
		return undefined // will never work
	    }
	    return false
	}
    }
    var cssrules=function(){
	var rules={}; var ds=document.styleSheets,dsl=ds.length
	for (var i=0;i<dsl;++i){
	    var valid = css_valid(ds[i])
	    if (valid === undefined) continue
	    while (!valid && --max_hacks > 0) {
		hack_delay()
		valid = css_valid(ds[i])
		if (valid === undefined) continue
	    }
	    if (max_hacks <= 0) alert("Warning: Firefox issue")
	    max_hacks = 10
	    if (!ds[i].cssRules) continue
            var dsi=ds[i].cssRules,dsil=dsi.length
	    for (var j=0;j<dsil;++j) {
		rules[dsi[j].selectorText]=dsi[j]
	    }
	}
	return rules
    }
    css=function(name,dontcreateifnotfound){
	var rules=cssrules()
	if (!rules.hasOwnProperty(name)) {
	    if (dontcreateifnotfound) return null
	    if (document.styleSheets.length == 0) {
		var style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode("")); // WebKit hack
		document.head.appendChild(style);
	    }
	    try {
		document.styleSheets[0].insertRule(name+"{ }",0)
	    } catch (err) {
		alert('css error:'+err)
	    }
	    return document.styleSheets[0].cssRules[0].style
	}
	return rules[name].style
    }
})()

var app2cache
var module_state = { }
var module_wants = { }
var module_alias = { }
function js(module,callback,attr) {
    if (!module) {
	return (typeof callback=="function") ? callback(): null
    }
    //if (module.slice(module.length-4) == ".css") {
    //return cssload(module.slice(0,module.length-4),callback)
    //}
    if (module_state[module] === true) {
	console.log("dependency "+module+" already loaded")
	callback()
	return
    } else if (typeof module_state[module] == "object") {
	console.log("adding dependant to "+module)
	module_state[module].push(callback)
    } else { // module_state[module] === undefined
	var script = document.createElement("script")
	script.setAttribute("type","text/javascript")
	if (attr) {
	    for (var i in attr) script.setAttribute(i,attr[i])
	}
	var ac = app2cache ? ".js" : (".js?anticache="+new Date().getTime())
	if (module.slice(0,8) == "https://" || module.slice(0,7) == "http://") {
	    script.setAttribute("src",module+".js")
	} else {
	    script.setAttribute("src",app_prefix+module+ac)
	}
	console.log("loading "+module)
	//app2_MLL_add(module)
	module_state[module] = [ callback ]
	script.onload = function() {
	    var sm = module.split("/")
	    var modname = sm[sm.length-1]
	    if (modname in module_alias) modname = module_alias[modname]
	    var getdeps=modname+"_requires"
	    var g = function() {
		var i
		console.log("onload "+module)
		//app2_MLL_sub(module)
		if (module in module_wants) {
		    for (i=module_wants[module].length-1;i>=0;i--) {
			if (module_state[module_wants[module][i]] === true) {
			    module_wants[module].splice(i,1)
			}
		    }
		    if (module_wants[module].length) {
			console.log("deferring "+module+" initialization due to "+module_wants[module])
			return
		    }	
		}
		if (module_state[module] === true) {
		    console.log("already initialized "+module)
		    return
		}
		console.log("initializing "+module)
		var modname2 = sm[sm.length-1]
		if (modname2 in module_alias) modname2 = module_alias[modname2]
		var i,f=modname2+"_init"
		if (f in window) {
		    console.log("calling "+f)
		    window[f].apply(this,global_args)
		    console.log("returned from "+f)
		} else {
		    console.log("not in window:"+f)
		}
		console.log("DEBUG3:",f," vs ",global_args)
		if (f == global_args[0] + "_init") {
		    //app2_MLL_done()
		}
		var tmp = module_state[module]
		module_state[module] = true
		for (i=tmp.length-1;i>=0;i--) {
		    if (typeof tmp[i] == "function") {
			tmp[i](module)
		    }
		}
	    }
	    var modname3 = sm[sm.length-1]
	    if (modname3 in module_alias) modname3 = module_alias[modname3]
	    var css_needs = modname3+"_css"
	    if (css_needs in window) {
		var i,deps = window[css_needs]()
		if (typeof deps == "string") {
		    cssload(deps)
		} else if (deps instanceof Array) {
		    var i
		    for (i=deps.length-1;i>=0;i--) cssload(deps[i])
		}
	    }
	    if (typeof window[getdeps] == "function") {
		var i,deps = window[getdeps]()
		//app2_MLL_sub(module)
		console.log("loaded "+module+" with deps="+deps)
		if (typeof deps == "string") {
		    if (deps != global_args[0]) {
			module_wants[module] = [ deps ]
			js(deps,g)
		    }
		} else if (deps instanceof Array) {
		    module_wants[module] = deps
		    var i
		    for (i=deps.length-1;i>=0;i--) {
			if (deps != global_args[0]) {
			    js(deps[i],g)
			}
		    }
		} else g()
	    } else g()
	}
	document.getElementsByTagName("head")[0].appendChild(script)
    }
}

function app_init() {
    if (document.location.search == "") {
	if (typeof app_loaded == "function") {
	    app_loaded()
	}
	// prompt to enter an app name
	return
    }
    var str = document.location.search
    if (!str) {
	return // or prompt for app name?
    }
    if (str[0] == "?") str = str.slice(1,str.length)
    global_args = str.split("+")
    document.title = global_args[0]
    js(global_args[0],function() {
	if (typeof app_loaded == "function") {
	    app_loaded()
	}
    })
}

// ============================================================================
// Web App
// ============================================================================
(function() {
    if (typeof window != "object") return
    var dangerKey1Pressed=false
    var dangerKey2Pressed=false
    window.addEventListener("keydown",function(event) {
	if (event.key == "Delete") {
	    dangerKey1Pressed=true
	} else if (event.key == "Backspace") {
	    dangerKey2Pressed=true
	}
    })
    window.addEventListener("keyup",function(event) {
	if (event.key == "Delete") {
	    dangerKey1Pressed=false
	} else if (event.key == "Backspace") {
	    dangerKey2Pressed=false
	}
    })
    window.addEventListener("beforeunload",function(event) {
	if (dangerKey1Pressed || dangerKey2Pressed) {
	    dangerKey1Pressed = dangerKey2Pressed = false
	    return event.returnValue = "Really leave this page?"
	}
    })
})()

var Global = function Global() {
    for (i=0;i<arguments.length;i++) {
	this[arguments[i].name] = arguments[i]
    }
}
Global(
    // Element functions
    A,B,Br,Button,Canvas,Col,ColGroup,Div,Em,Font,H1,H2,H3,H4,H5,H6,HR,I,Img,LI,
    Meta,OL,Option,P,Pre,Progress,Section,Span,Strike,Strong,Table,TBody,
    TD,TFoot,TH,THead,TR,TT,U,UL,Video,tagMap,
    // supported $ functions
    $attr, $add, $id, css, cssload, $del, EventMouseDownButton, EventKeyDownButton,
    EventKeyUpButton, EventMouseUpButton, Input, Select, TextArea, $value, $index,
    EventChangeInput, EventChangeCheckbox, EventChangeButton, EventChangeRadio,
    EventChangeButton,
    // other
    Global,Register,_PseudoElement,PseudoElementMarkup
)

function Register(module, init, requires) {
    if (typeof module == "object" && module.exports) {
	module.exports = { init:init, requires:requires }
    }
    return module
}

/*
  We need a way to require a module in node.js and have all the dependencies
  loaded properly.  We do this by exporting our app as a function which loads
  the app passed as argument.
 */

if (typeof module == "object" && module.exports) {
    var deps = { "app":true }
    var load = function(app) {
	var i, dep
	var appname = app.split("/")
	appname = appname[appname.length-1]
	if (appname in deps) return
	deps[appname] = true
	dep = require(app)
	if (dep.requires && typeof(dep.requires) == "function") {
	    var reqs = dep.requires()
	    if (typeof reqs == "string") {
		load(reqs)
	    } else {
		for (i=0;i<reqs.length;i++) {
		    load(reqs[i])
		}
	    }
	}
	if (typeof dep.init == "function") {
	    dep.init(appname)
	}
    }
    module.exports = load
} else {
    module = false
}



// ============================================================================
// UI stuff (to be cleaned up / documented)
// ============================================================================

var GlobalTabIndex = 0

function EventDispatch(name,me,event) {
    var i,handlers = me.getAttribute("on"+name+"list")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    }
}

function EventChangeRadio(me,event) {
    var i,n=-1,radios = document.getElementsByName(me.name)
    var changelist = [ ], f

    var val = me.getAttribute("data-value")
    if (!val) val = me.id
    if (!val) val = n
    me.setAttribute("value",val)
    me.defaultChecked = true
    
    for (i=0;i<radios.length;i++) {
	if (radios[i].tagName != "INPUT" || radios[i].type != "radio") continue
	f = radios[i].getAttribute("onchangelist")
	if (f) changelist.push(f)
	if (radios[i] == me) { n = i; continue }
	radios[i].setAttribute("value", val)
	radios[i].defaultChecked = false
    }
    // TO DO: remove duplicate functions in the changelist
    var i,handlers = changelist.join(",")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    }
}

function EventChangeCheckbox(me,event) {
    me.setAttribute("value",me.checked ? me.name : "")    
    me.defaultChecked = !!me.checked
    var i,handlers = me.getAttribute("onchangelist")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    }
}

// INPUT, SELECT, TEXTAREA
function EventChangeInput(me,event) {
    me.setAttribute("value",me.value)
    var i,handlers = me.getAttribute("onchangelist")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    } else {
	handlers = me.onchangelist
	if (handlers) {
	    for (i=0;i<handlers.length;i++) {
		if (typeof handlers[i] == "function") handlers[i](me,event)
	    }
	}
    }
}

function EventChangeButton(me,event) {
    var i,handlers = me.getAttribute("onchangelist")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    } else {
	handlers = me.onchangelist
	if (handlers) {
	    for (i=0;i<handlers.length;i++) {
		if (typeof handlers[i] == "function") handlers[i](me,event)
	    }
	}
    }
}

function EventClickButton(me,event) {
    var i,handlers = me.getAttribute("onclicklist")
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    } else {
	handlers = me.onclicklist
	if (handlers) {
	    for (i=0;i<handlers.length;i++) {
		if (typeof handlers[i] == "function") handlers[i](me,event)
	    }
	}
    }
}

function EventKeyDownButton(me,event) {
    var tmp = me, id
    console.log("keydown",event.key,event.ctrlKey)
    if (event.ctrlKey) {
	while (tmp && tmp != document && !id) {
	    id = $attr(tmp,"data-hotkey-"+event.key)
	    if (!id) tmp = tmp.parentNode
	}
    }
    if (id) {
	me.hotkeyPending = true
	me = $id(id)
    }
    if ((event.key == "Space" || id)
	&& me.getAttribute("value") != "true") {
	//console.log("OKES")
	if (typeof event.stopPropagation == "function") event.stopPropagation()
	if (typeof event.preventDefault == "function") event.preventDefault()
	me.setAttribute("value","true")
	me.classList.add("active")
	EventChangeButton(me,event)
	return false
    }
}

function EventKeyUpButton(me,event) {
    var tmp = me, id
    console.log("keyup",event.key,event.ctrlKey)
    if (event.ctrlKey || me.hotkeyPending) {
	console.log("considering ",tmp)
	while (tmp && tmp != document && !id) {
	    id = $attr(tmp,"data-hotkey-"+event.key)
	    console.log("id=",id)
	    if (!id) tmp = tmp.parentNode
	}
    }
    if (id) {
	me.hotkeyPending = false
	console.log("keyup found hotkey")
	me = $id(id)
    }
    if ((event.key == "Space" || id)
	&& me.getAttribute("value") != "false") {
	//console.log("OK2")
	if (typeof event.stopPropagation == "function") event.stopPropagation()
	if (typeof event.preventDefault == "function") event.preventDefault()
	me.setAttribute("value","false")
	me.classList.remove("active")
	EventChangeButton(me,event)
	EventClickButton(me,event)
	return false
    }
}

function EventMouseDownButton(me,event) {
    if (me.getAttribute("value") != "true") {
	me.setAttribute("value","true")
	EventChangeButton(me,event)
    }
}

function EventMouseUpButton(me,event) {
    if (me.getAttribute("value") != "false") {
	me.setAttribute("value","false")
	EventChangeButton(me,event)
    }
}

// User Interface (input) elements
// Button, Input, Select, TextArea

function Button() {
    var xz = document.createElement("button")
    $attr(xz,{tabindex:(""+(++GlobalTabIndex))})
    $add(xz,arguments)
    xz.setAttribute("value","false")
    xz.setAttribute("onkeydown","EventKeyDownButton(this,event)")
    xz.setAttribute("onkeyup","EventKeyUpButton(this,event)")
    xz.setAttribute("onmousedown","EventMouseDownButton(this,event)")
    xz.setAttribute("onmouseup","EventMouseUpButton(this,event)")
    xz.setAttribute("onclick","EventClickButton(this,event)")
    return xz
}

// Checkbox -> { type:"checkbox" }
//     note: value is <name> when checked (or "true" if no name) and "" when not
// Radio -> { type:"radio" }
//     All radios with the same name are aggregated into a single event model,
//     so that whenever any radio in the group is clicked (other than the one
//     already selected) a single change event is sent to all listeners
//     registers on any individual button.
//     the value of all radio buttons will be the value of the selected button,
//     which will be attribute data-value if it exists, otherwise the id of
//     the element, if it exists, otherwise the index of the radio element
//     in the page (as found by document.getElementsByName).
// DateField -> { type:"date" }
// TimeField -> { type:"time", step:"1" }
// DateTimeField ->  { type:"datetime-local" }
// NumericField -> { type:"number" }
// PasswordField -> { type:"password" }
// TextField -> { type:"text" }

function Input() {
    var xz = document.createElement("input")
    $attr(xz,{tabindex:""+(++GlobalTabIndex)})
    $add(xz,arguments)
    // we probably should use something other than true/false for checkboxes
    // and radio buttons, in case we should want to submit. we should have
    // a default value (not defaultChecked or defaultValue) which specifies the
    //value to set when the box is checked.
    if (xz.type == "checkbox") {
	if (!xz.name) xz.name="true"
	xz.setAttribute("value",xz.checked ? xz.name : "")
	xz.defaultChecked = !!xz.checked
	xz.setAttribute("onchange","EventChangeCheckbox(this,event)")
    } else if (xz.type == "radio") {
	xz.setAttribute("value",xz.checked ? "true" : "false")
	xz.defaultChecked = xz.checked
	xz.setAttribute("onchange","EventChangeRadio(this,event)")
    } else {
	xz.setAttribute("onchange","EventChangeInput(this,event)")
    }
    /*
    xz.setAttribute("onkeydown",'EventDispatch("keydown",this,event)')
    xz.setAttribute("onkeyup",'EventDispatch("keyup",this,event)')
    xz.setAttribute("onmousedown",'EventDispatch("mousedown",this,event)')
    xz.setAttribute("onmouseup",'EventDispatch("mouseup",this,event)')
    xz.setAttribute("onkeypress",'EventDispatch("keypress",this,event)')
    xz.setAttribute("onmouseclick",'EventDispatch("mouseclick",this,event)')
    */
    return xz
}

// Pulldown() could do this:
// 1. abbreviate Select(Option(1),Option(2),...) to Pulldown([1,2,...])
// 2. handle showing a grayed out "Select One" when nothing is selected,
//    and making this go away if needed once something is selected
function Select() {
    var xz = document.createElement("select")
    $attr(xz,{tabindex:(""+(++GlobalTabIndex))})
    $add(xz,arguments)
    xz.setAttribute("onchange","EventChangeInput(this,event)")    
    return xz
}

// TextArea({rows:xxx,cols:yyy},"text contents")
function TextArea() {
    var xz = document.createElement("textarea")
    $attr(xz,{tabindex:(""+(++GlobalTabIndex))})
    $add(xz,arguments)
    xz.setAttribute("onchange","EventChangeInput(this,event)")
    return xz
}

// remove the specific function name to the list of functions to call when the
// specified event has occured on HTMLElement xz
function $off(xz,event,fname) {
    xz = (typeof xz == "string") ? document.getElementById(xz) : xz
    if (!xz) return
    var list = xz.getAttribute("on"+event+"list")
    if (!list) {
	list = [ ]
    } else {
	list = list.split(";")
    }
    var toRemove = list.indexOf(fname)
    if (toRemove >= 0) {
	list.splice(toRemove,1)
    }
    if (list.length == 0) {
	xz.removeAttribute("on"+event+"list")
	if (event != "change") xz.removeAttribute("on"+event)
    } else {
	xz.setAttribute("on"+event+"list",list.join(";"))
    }
}

// add the specific function name to the list of functions to call when the
// specified event has occured on HTMLElement xz
function $on(xz,event,fname) {
    xz = (typeof xz == "string") ? document.getElementById(xz) : xz
    if (!xz) return
    if (event != "change" && !xz.getAttribute("on"+event)) {
	xz.setAttribute("on"+event,'EventDispatch("'+event+'",this,event)')
    }
    var list = xz.getAttribute("on"+event+"list")
    if (!list) {
	list = [ ]
    } else {
	list = list.split(";")
    }
    // TO DO: don't add duplicate names
    list.push(fname)
    xz.setAttribute("on"+event+"list",list.join(";"))
}

// Useful functions for dealing with cursors and selections
function FindPointInText(x,y,txt) {
    var orig = txt.nodeValue || ""
    var txt1 = orig.slice(0,orig.length/2)
    var txt2 = orig.slice(orig.length/2,orig.length)
    var span0,span1,span2,rect1,rect2,ret=null
    $replace(txt,span0=Span(span1=Span(txt1),span2=Span(txt2)))
    rect1 = span1.getBoundingClientRect()
    rect2 = span2.getBoundingClientRect()
    if (x >= rect1.left && x <= rect1.right && y >= rect1.top && y <= rect1.bottom) { // click is in span1
	if (txt1.length > 1) {
	    ret=FindPointInText(x,y,span1.firstChild)
	} else { // nothing in span1, so click is at start of text
	    ret=0
	}
    } else if (x >= rect2.left && x <= rect2.right && y >= rect2.top && y <= rect2.bottom) { // click is in span2
	if (txt1.length > 1) {
	    ret=txt1.length+FindPointInText(x,y,span2.firstChild)
	} else { // nothing in span2, so click is at end of text
	    ret=txt1.length // -1 ???
	}
    } // else... should not reach here, click wasn't in either span!
    $replace(span0,txt)
    return ret
}

function CursorPosGet(ob) {
    if (document.selection) {
        ob.focus()
        var sel = document.selection.createRange()
        sel.moveStart('character', -ob.value.length)
        return sel.text.length
    } else if (ob.selectionStart || ob.selectionStart == '0') {
        return ob.selectionStart
    }
}

function CursorPosSet(ob, pos) {
    if(ob.setSelectionRange) {
        ob.focus()
	ob.setSelectionRange(pos,pos)
	setTimeout(function() {
            ob.setSelectionRange(pos,pos)
	},0)
    } else if (ob.createTextRange) {
        var range = ob.createTextRange()
        range.collapse(true)
        range.moveEnd('character', pos)
        range.moveStart('character', pos)
        range.select()
    }
}

function SelectionClear() {
    if (window.getSelection) {
	if (window.getSelection().empty) {  // Chrome
	    window.getSelection().empty();
	} else if (window.getSelection().removeAllRanges) {  // Firefox
	    window.getSelection().removeAllRanges();
	}
    } else if (document.selection) {  // IE?
	document.selection.empty();
    }
}

function onElementLoad(elem,f) {
    if (typeof elem == "string") {
	if (!$id(elem)) {
	    window.requestAnimationFrame(function () {onElementLoad(elem,f) })
	    return
	}
    } else {
	if (elem.getBoundingClientRect().width == 0) {
	    window.requestAnimationFrame(function() {onElementLoad(elem,f)})
	    return
	}
    }
    f(elem)
}
