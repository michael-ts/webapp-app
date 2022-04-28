var app_version = "1.7.0"

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
    return elem2
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
    if (old && old.parentNode) {
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
    return child
}

function $last(parent,child) {
    if (typeof parent == "string") parent = document.getElementById(parent)
    if (typeof child == "string") child = document.getElementById(child)
    parent.appendChild(child)
    return child
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
    if (!xz) return
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
function Footer() {
    return $add(_HTMLElement("footer"),arguments)
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
function Header() {
    return $add(_HTMLElement("header"),arguments)
}
function HR() {
    return $add(_HTMLElement("hr"),arguments)
}
function I() {
    return $add(_HTMLElement("i"),arguments)
}
function IFrame() {
    return $add(_HTMLElement("iframe"),arguments)
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
    IFRAME:'IFrame',
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
		    console.log("DONE?",module_state[module])
		    apprun()
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

var _appmap = { }
function appmap(url,scrn) {
    url = url.split("/")
    var i, U = _appmap
    for (i=0;i<url.length;i++) {
	if (!(url[i] in U)) U[url[i]] = { }
	U = U[url[i]]
    }
    U[""] = scrn
}

var scrnAborts = { }
function screen_abort_add(name,f) {
    scrnAborts[name] = f
}

function screen_abort_remove(name) {
    delete scrnAborts[name]
}

var appWidgetCount=0
async function apprun() {
    var i
    for (i in scrnAborts) {
	scrnAborts[i]()
    }
    scrnAborts = { }
    if (arguments.length > 0) {
	global_args = Array.from(arguments)
	history.pushState({},name,"/app/"+global_args.join("/"))	
    }
    if (EventChangeRecording) {
	EventChangeLog.push({op:"Run",args:global_args,t:new Date()})	
    }
    var x=global_args[0],U=_appmap
    for (i=1;i<global_args.length;i++) global_args[i] = decodeURI(global_args[i])
    for (i=0;i<global_args.length;i++) {
	var l = global_args[i]
	if (i+1 == global_args.length) {
	    l = l.split("#")
	    l = l[0]
	}
	if (l in U) {
	    U = U[l]
	} else break
	if (typeof U == "string") break
    }
    if (U[""]) x = U[""]
    var state = screenstateget()
    await appscreen(x,state)
}

function Layout_Screen() {
    return Div({style:{display:"grid",
				gridTemplateColumns:"100%",
				gridTemplateRows:"100%",
				overflow:"hidden"}},arguments)
}

function Layout_Grid(grid,...rest) {
    return Div({style:{
	display:"grid",
	gridTemplateColumns:grid.cols,
	gridTemplateRows:grid.rows,
	gridTemplateAreas: grid.areas,
	overflow:"hidden"}},rest)
}

var currentScreen, currentDialogs = []

window.onpopstate = function() {
    var a=appinfo()
    global_args = a.app_path
    apprun()
}

function screenload(app_path,state) {
    var args = app_path.split("/")
    if (state) {
	var str = Object.keys(state).map(k=>`${encodeURIComponent(k)}=${encodeURIComponent(state[k])}`).join(";")
	args[args.length-1] = args[args.length-1] + "#" + str
    }
    apprun.apply(this,args)
}

function screenstateget() {
    var ob = { }
    document.location.hash.slice(1).split(";").map(x=>{
	var k,v,parts = x.split("=").map(decodeURIComponent)
	if (parts.length < 2) return
	k = parts.shift()
	v = parts.join("=")
	ob[k] = v
    })
    return ob
}

function screenstateset(ob) {
    //var str = [ ]
    str = Object.keys(ob).map(k=>`${encodeURIComponent(k)}=${encodeURIComponent(ob[k])}`).join(";")
    history.pushState({},"","#"+str)
}

var logged_in_user = ""
async function Login(dialogargs) {
    var new_user = await appdialog(UserPasswordDialog,dialogargs)
    if (!new_user) return
    if (typeof LoginHook == "function"
	&& !(await LoginHook(new_user))) {
	return
    }
    new_user = new_user.user
    $id("username").textContent = new_user
    logged_in_user = new_user
}

async function appscreen(f,state) {
    if (typeof f != "function") return
    while (currentDialogs.length) $del(currentDialogs.pop())
    var parent
    if (currentScreen == doc) {
	doc.innerHTML = ""
	parent = doc
    } else if (currentScreen) {
	parent = currentScreen.parentNode
	$del(currentScreen)
    } else {
	parent = doc
    }
    var contents = await f(state)
    var back, forward, user, help
    if (!logged_in_user) {
	if (typeof LoggedInCheck == "function") {
	    var user = await LoggedInCheck()
	    if (user) logged_in_user = user
	}
	if (!logged_in_user) {
	    logged_in_user = "Guest"
	}
    }
    var ctrl = Layout_Grid(
	{
	    cols:"15% 15% 15% 5% 5% 5% 10% 15% 15%",
	    rows:"100%",
	    areas:'"back A B C1 C2 C3 F G forward"'
	},
	back=Button("",{class:"ORANGE RoundedL",style:{gridArea:"back"}}),
	help=Button("Help",{class:"GREEN",style:{gridArea:"A"}}),
	Button("Layout",{class:"GREEN",style:{gridArea:"B"}}),
	Button({id:"AppStatus1",class:"BLACK",disabled:"disabled",style:{gridArea:"C1"}}),
	Button({id:"AppStatus2",class:"BLACK",disabled:"disabled",style:{gridArea:"C2"}}),
	Button({id:"AppStatus3",class:"BLACK",disabled:"disabled",style:{gridArea:"C3"}}),
	// Introductory Help
	// Help Summary
	//Button("Context Specific Help",{class:"GREEN",style:{gridArea:"C"}}),
	//Button("Search for Help",{class:"GREEN",style:{gridArea:"D"}}),
	//Button("Report Issue",{class:"GREEN",style:{gridArea:"E"}}),
	Button("User:",{class:"WHITE",style:{gridArea:"F"}}),
	user=Button(logged_in_user,{id:"username",class:"BLUE",style:{gridArea:"G"}}),
	forward=Button("",{class:"ORANGE RoundedR",style:{gridArea:"forward"}})
    )
    back.onclicklist = [ ()=>history.back() ]
    forward.onclicklist = [ ()=>history.forward() ]
    help.onclicklist = [ async ()=> {
	var choice = await appdialog(ChoiceList, {
	    id:"helpMenu",
	    choices:[
		"Introduction",
		"Quick Reference",
		"Help on Current Screen",
		"Search for Help",
		"Report an Issue"
	    ],
	    scrollers:false,
	    h:"20%",
	    cancel:true
	})
	css(".scroller").color="white"
	switch (choice[1]) {
	case 0: // Introductory Help (Intro to WebApp)
	    await appdialog(HelpIntroDialog,{})
	    break
	case 1: // Help Summary (Quick Reference)
	    await appdialog(HelpReferenceDialog,{f:getcontents})
	    break
	case 2: // Context Specific Help
	    await appdialog((args,resolve,reject)=>{
		var help = $attr(contents,"help")
		if (!help) help = "This screen has not provided any context sensitive help.  Please contact the developer of this app to resolve this issue."
		var ok = Button("Dimiss Help",{class:"ORANGE"})
		ok.onclicklist = [ ()=>resolve() ]
		var ret=Layout_Screen(
		    WidgetScroller(
			H1("About this screen"),
			P(help),
			{
			    id:"gt1",
			    scrollers: true,
			    orientation:"v",
			    footer: ok,
			    //footer_h: "5%"
			}
		    ))
		return ret
	    },{})
	case 3: // Search for Help
	case 4: // Report an Issue
	}
	console.log(choice)
    } ]
    user.onclicklist = [ async ()=>{
	switch (logged_in_user) {
	case "Guest": // user is not given the opportunity to log in
	case "Stranger": // user is unable to log in successfully
	case "Anonymous": // user declines to provide their identity
	    Login({})
	    break
	default: // user logs in successfully
	    var do_logout = await appdialog(OkCancelDialog,{text:"Log out?"})
	    console.log(do_logout)
	    if (do_logout) {
		if (typeof LogoutHook == "function"
		    && !(await LogoutHook(logged_in_user))) return // not recommended!
		logged_in_user = "Anonymous"
		$id("username").textContent = logged_in_user
	    }
	}
    } ]
    contents.style.gridArea = "AAA"
    ctrl.style.gridArea = "BBB"

    var scr = Layout_Grid(
	{
	    cols:"100%",
	    rows:"90% 10%",
	    areas:'"AAA" "BBB"'
	},
	contents,
	ctrl
    )
    $add(parent,Div({id:"screen",
		     style:{display:"grid",
			    gridTemplateColumns:"100vw",
			    gridTemplateRows:"100vh",
			    overflow:"hidden"}},scr))

    // (TO DO: handle dialogs properly)
    var is_landscape = (window.innerWidth > window.innerHeight)
    var g = function() {
	var new_is_landscape = (window.innerWidth > window.innerHeight)
	if (new_is_landscape == is_landscape) return
	is_landscape = new_is_landscape
	appscreen(name)
    }
    //window.onorientationchange = window.resize = g
    // TO DO: window.onresize from ui.js
    
    // (TO DO: If not a dialog,) assign the screen to the screen object so it can be disposed of later
    currentScreen = doc
    currentScreen.f_resize = g
}

async function appdialog(f,args) {
    if (typeof f != "function") return
    var resolve_f, reject_f, contents, ret, index, finish, dialog
    var hasFocus = document.activeElement
    // TO DO: $del() the object and remove it from the currentDialogs array
    finish = function(f,args) {
	$del(dialog)
	currentDialogs.splice(index,1)
	f.apply(window,args)
	if (hasFocus) hasFocus.focus()
    }
    ret =  new Promise(function(resolve, reject) {
	resolve_f = function() { finish(resolve,arguments) }
	reject_f = function() { finish(reject,arguments) }
    })
    contents = await f(args?args:{},resolve_f, reject_f)
    index = currentDialogs.length
    currentDialogs.push(contents)
    $add(doc,dialog=Div({id:"dialog"+currentDialogs.length,
		  style:{display:"grid",
			 backgroundColor:"#000000",
			 gridTemplateColumns:"100vw",
			 gridTemplateRows:"100vh",
			 overflow:"hidden",
			 position:"absolute",
			 left:0,top:0,width:"100vw",height:"100vh",
			 zIndex:(1000+index)}},contents))
    // to do: handle dialogs properly on screen resize
    return ret
}

/*
  appdialog function to display a list of choices.
  args: {
      id: "<id>",
      choices: [ ... ],
      cancel: <boolean or text for cancel button (default: "Cancel")
      title: text for title (optional)
      default: "<current value>"
  }
*/
function ChoiceList(args,resolve,reject) {
    var h = ("h" in args) ? args.h : "10%"
    if (!args.id) args.id="ChoiceList"
    var cancel, title
    if (args.cancel) {
	var text = (typeof args.cancel == "string" ? args.cancel : "Cancel")
	cancel = Button(text,{id:args.id+"0",class:"ORANGE RoundedL",style:{width:"100%",height:h}})
	cancel.onclicklist = [ function() { resolve([false,-1]) } ]
    }
    if (args.title) {
	title = Button(args.title,{id:args.id+"0",class:"TEXTBLACK",disabled:"disabled",style:{width:"100%",height:h}})
    }
    if (!args.default) args.default = args.choices[0]
    var buttons = args.choices.map((choice,i)=>{
	var button = Button(choice, {id:args.id+i,class:"BLUE",style:{width:"100%",height:h}})
	button.onclicklist = [ function() { resolve([choice,i]) } ]
	if (choice == args.default) {
	    onElementLoad(button,function() {
		console.log(button)
		button.focus()
	    })
	}
	return button
    })
    var config = {
	id:args.id,
	scrollers:args.scrollers,
	orientation:"v"
    }
    if (cancel) config.header = cancel //buttons.unshift(cancel)
    if (title) config.footer = title
    if (!("scrollers" in args)) args.scrollers = true
    var ret = WidgetScroller(buttons, config)
    return ret
}

// Create a Button that opens a ChoiceList when clicked
function ChoiceListButton(text,buttonstyle,opts,post,pre) {
    var sty = {style:{gridArea:"L"}}

    if (buttonstyle.style && "fontSize" in buttonstyle.style) {
	sty.style.fontSize = buttonstyle.style.fontSize
	delete buttonstyle.style.fontSize
    }
    if (buttonstyle && "id" in buttonstyle) {
	sty.id = buttonstyle.id
	delete buttonstyle.id
    }
    var mydiv
    var sub = Layout_Grid(
	{
	    cols:"95% 5%",
	    rows:"50% 50%",
	    areas:'"L T" "L B"'
	},
	mydiv=Div(text,sty,{style:{fontSize:"1em"}}),
	Div("▲",{style:{gridArea:"T",fontSize:"0.33em"}}),
	Div("▼",{style:{gridArea:"B",fontSize:"0.33em"}})
    )
    mydiv.opts = opts // expose for CMJobCheck
    var ret=Button(sub,buttonstyle)
    ret.onclicklist = [
	async() => {
	    if (pre) await pre()
	    var choice = await appdialog(ChoiceList, opts)
	    if (choice[0] && opts.auto != false) mydiv.textContent = choice[0]
	    if (post) post(choice)
	}
    ]
    return ret
}


// TO DO: make all unrecognized properties get assigned to returned div
function WidgetScroller() {
    // id: id of the Div containing the content
    //     ${id} - container
    //     ${id}ScrollUp - scroll up button
    //     ${id}Content - contents
    //     ${id}ScrollDn - scroll down button
    // scrollers: if true, show scrollers

    var list = [ ], content = Div(), ti0, ti1, config = { }, i, j
    for (i=0;i<arguments.length;i++) {
	if (arguments[i] &&
	    Object.getPrototypeOf(arguments[i]) === Object.prototype) {
	    for (j in arguments[i]) {
		config[j] = arguments[i][j]
	    }
	} else {
	    $add(content,arguments[i])
	}
    }
    if (config.style) $add(content,{style:config.style})
    
    var UD = (config.orientation != "h")
    var offsetTop = UD ? "offsetTop" : "offsetLeft"
    var Y = UD ? "y" : "x"
    var width = UD ? "width" : "height"
    var height = UD ? "height" : "width"
    var RoundedT = (UD?"RoundedT":"RoundedL")
    var RoundedB = (UD?"RoundedB":"RoundedR")
    if (config.scrollers) {
	var scrollup = Button("",{id:(config.id+"ScrollUp"),class:"ORANGE "+RoundedT})
	var scrollers_h = (typeof config.scrollers == "boolean") ? 10 : config.scrollers
	scrollup.style[width]="100%"
	
	scrollup.style[height]=scrollers_h+"%"
	var scrolldn = Button("",{id:(config.id+"ScrollDn"),class:"ORANGE "+RoundedB})
	scrolldn.style[width]="100%" 
	scrolldn.style[height]=scrollers_h+"%"
	ti0 = scrollup.tabIndex
	ti1 = scrolldn.tabIndex

	if (!UD) scrollup.style.verticalAlign = "top"
	if (!UD) scrolldn.style.verticalAlign = "top"
	scrollup.onclicklist = [ function() {
	    var i, top = content.childNodes[0][offsetTop]
	    for (i=content.childNodes.length-1;i>=0;i--) {
		var y = content.childNodes[i].getBoundingClientRect()[Y] - top
		if (y < 0 && content.childNodes[i].style.display != "none") {
		    content.scrollBy(UD?0:y,UD?y:0)
		    break
		}
	    }
	} ]
	
	scrolldn.onclicklist = [ function() {
	    var i, top = content.childNodes[0][offsetTop]
	    for (i=0;i<content.childNodes.length;i++) {
		var y = content.childNodes[i].getBoundingClientRect()[Y] - top
		if (Math.floor(y) > 0) {
		    content.scrollBy(UD?0:y,UD?y:0)
		    break
		}
	    }
	} ]
	list.push(scrollup)
    }
    if (config.header && !config.header_h) config.header_h = 10
    if (config.footer && !config.footer_h) config.footer_h = 10
    if (config.header) {
	list.push(config.header)
	config.header.style.height = config.header_h+"%"
	config.header.style.width = "100%"
    }
    if (content) {
	var oh = (config.footer_h ? config.footer_h : 0) + (config.header_h ? config.header_h : 0)
	var h = (config.scrollers ? ((typeof config.scrollers == "boolean") ? 80-oh : (100-oh-2*config.scrollers)) : 100-oh)
	content.classList.add("scroller")
	content.style.overflow="scroll"
	content.style[height]=h+"%"
	content.id = config.id+"Content"
	list.push(content)
    }
    if (config.footer) {
	list.push(config.footer)
	config.footer.style.height = config.footer_h+"%"
	config.footer.style.width = "100%"
    }
    if (config.scrollers) {
	list.push(scrolldn)
    }
    var scrollerx = css(".scroller::-webkit-scrollbar")
    scrollerx.width=0
    scrollerx.height=0
    var scroller = css(".scroller")
    scroller.overflow = "-moz-scrollbars-none"
    scroller.msOverflowStyle = "none"
    scroller.scrollbarWidth = "none"
    scroller.scrollbarHeight = "none"

    var scrollTop = (UD?"scrollTop":"scrollLeft")
    var scrollHeight = (UD?"scrollHeight":"scrollWidth")
    var clientHeight = (UD?"clientHeight":"clientWidth")
    var ret = Div(list,{id:config.id})
    var started
    var f = function(evt) {
	//console.log(`content.scrollTop=${content.scrollTop} content.clientHeight=${content.clientHeight} content.scrollHeight=${content.scrollHeight}`)
	if (content[scrollTop] == 0) {
	    scrollup.style.background="#806757"
	    scrollup.tabIndex = 0
	} else {
	    scrollup.style.background=""
	    scrollup.tabIndex = ti0
	}
	if (content[clientHeight] + content[scrollTop] == content[scrollHeight]) {
	    scrolldn.style.background="#806757"
	    scrolldn.tabIndex = 0
	} else {
	    scrolldn.style.background=""
	    scrolldn.tabIndex = ti1
	}
	if (!started) setTimeout(f,10)
	started = true
    }
    if (config.scrollers) {
	content.onscroll = f
	onElementLoad(content,f)
    }
    return ret
}

function Outline() {
    var i,j,args = Array.prototype.slice.call(arguments), opts = { }
    args = args.flat()
    for (i=args.length-1;i>=0;i--) {
	if (Object.getPrototypeOf(args[i]) === Object.prototype) {
	    for (j in args[i]) {
		opts[j] = args[i][j]
	    }
	    args.splice(i,1)
	}
    }
    if (arguments.length < 2) return
    var div1 = args[0]
    if (!(div1 instanceof HTMLElement)) div1 = Div(div1)
    args.shift() // apparently works without this though it's wrong
    var div2 = Div(args)
    div2.classList.add("outline2")
    div2.style.borderTopLeftRadius="10px"
    div1.onclick = async function() {
	if (div2.style.display) {
	    div2.style.display=""
	    div1.classList.remove("outline1")
	} else {
	    div2.style.display="none"
	    div1.classList.add("outline1")
	}
    }
    if (opts.open === false) div1.onclick()
    return [ div1, div2 ]
}

var months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
]

function DaysInZMonth(year,zmonth) {
    var dim = 28
    var t = new Date(year,zmonth,dim)
    t.setDate(dim)
    while (1) {
	t.setDate(t.getDate()+1)
	if (t.getMonth() != zmonth) break
	dim++
    }
    return dim
}

function CalendarDays(year, zmonth,resolve) {
    var ret = [ ]
    var dom = 1
    var t = new Date(year,zmonth,1)
    var dow = t.getDay()
    var dim = DaysInZMonth(year,zmonth)
    var DOW = [ "S", "M", "T", "W", "R", "F", "A" ]
    var week=1
    dom -= dow
    for (dow=0;dom<=dim;dom++) {
	if (dom > 0) {
	    var b
	    ret.push(b=Button(dom,{id:"dom"+dom,class:"BLUE",style:{gridArea:DOW[dow]+week}}))
	    b.onclicklist = [ ((i)=>function() {
		resolve([new Date(year,zmonth,i),year,zmonth,i])
	    })(dom) ]
	}
	if (++dow % 7 == 0) {
	    dow = 0
	    week++
	}
    }
    return ret
}

/*
  To use the Calendar dialog, add code something like this:

    var ret = await appdialog(Calendar, {
	id:"calendar", t:new Date()
    })
    if (ret) console.log(ret[0].toISOString())

    if cancelled, returns [ false ]
    otherwise returns [ new Date(), year, zmonth, dom ]
*/

function Calendar(args,resolve,reject) {
    var prev,canc,mo,yr,next,day
    var t0
    if ("t" in args) {
	t0 = new Date(args.t)
    } else {
	t0 = new Date()
    }
    var year = t0.getYear()+1900
    var zmonth = t0.getMonth()
    var dom = t0.getDate()
    var dow = t0.getDay()
    var dim,tmp
    var calc = function() {
	var i
	for (i=1;i<=dim;i++) $del("dom"+i)
	tmp = CalendarDays(year,zmonth,resolve)
	dim = tmp.length
	$add(ret,tmp)
    }
    var ret = Layout_Grid(
	{
	    cols:"14% 15% 14% 14% 14% 15% 14%",
	    rows:"12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5% 12.5%",
	    areas:'"prev cancel mo mo mo yr next" "S M T W R F A" "S1 M1 T1 W1 R1 F1 A1" "S2 M2 T2 W2 R2 F2 A2" "S3 M3 T3 W3 R3 F3 A3" "S4 M4 T4 W4 R4 F4 A4" "S5 M5 T5 W5 R5 F5 A5" "S6 M6 T6 W6 R6 F6 A6" '
	},
	prev = Button({class:"ORANGE RoundedL",style:{gridArea:"prev"}}),
	canc = Button("cancel",{class:"ORANGE RoundedT",style:{gridArea:"cancel"}}),
	mo = Button(months[zmonth],{class:"BLUE",style:{gridArea:"mo"}}),
	yr = Button(year,{class:"BLUE",style:{gridArea:"yr"}}),
	next = Button({class:"ORANGE RoundedR",style:{gridArea:"next"}}),
	Button("S",{class:"WHITE",style:{gridArea:"S"}}),
	Button("M",{class:"WHITE",style:{gridArea:"M"}}),
	Button("T",{class:"WHITE",style:{gridArea:"T"}}),
	Button("W",{class:"WHITE",style:{gridArea:"W"}}),
	Button("R",{class:"WHITE",style:{gridArea:"R"}}),
	Button("F",{class:"WHITE",style:{gridArea:"F"}}),
	Button("S",{class:"WHITE",style:{gridArea:"A"}}),
	tmp = CalendarDays(year,zmonth,resolve)
    )
    dim = tmp.length
    canc.onclicklist = [ ()=>resolve(false) ]
    prev.onclicklist = [ ()=>{
	t0.setMonth(t0.getMonth()-1)
	year = t0.getYear()+1900
	zmonth = t0.getMonth()
	dom = t0.getDate()
	dow = t0.getDay()
	mo.textContent = months[zmonth]
	yr.textContent = ""+year
	calc()
    } ]
    next.onclicklist = [ ()=>{
	t0.setMonth(t0.getMonth()+1)
	year = t0.getYear()+1900
	zmonth = t0.getMonth()
	dom = t0.getDate()
	dow = t0.getDay()
	mo.textContent = months[zmonth]
	yr.textContent = ""+year
	calc()
    } ]
    mo.onclicklist = [ async ()=>{
    	var ret = await appdialog(ChoiceList, {
	    id:"eventMenu",choices:months,scrollers:false,h:"20%",cancel:true,default:mo.textContent
	})
	if (!ret[0]) return
	mo.textContent = ret[0]
	zmonth = ret[1]
	t0 = new Date(yr,zmonth,dom)
	calc()
    }]
    yr.onclicklist = [ ()=>{
	console.log("Prompting for year")
	var ret = prompt("Enter year")
	console.log("Prompt returned year",ret)
	var i = parseInt(ret)
	if (!isNaN(i)) {
	    if (!isNaN(new Date(i,zmonth,dom))) {
		yr.textContent = ""+i
		year = i
		t0 = new Date(yr,zmonth,dom)
		calc()
	    }
	}
    }]
    onElementLoad("dom1",function() {
	$id("dom"+dom).focus()
    })
    return ret
}

/*
  To use the Clock dialog, add code something like this:

    var ret = await appdialog(Clock, {
	id:"clock", t:new Date()
    })
    if (ret[0]) console.log(ret[0].toISOString())

    if cancelled, returns [ false ]
    otherwise return [ passed_date_with_time_updated ]
*/
function Clock(args,resolve,reject) {
    var cancel, accept, live, H,M,S,MS,AM, isLive, selectedHand="H"
    var t
    if ("t" in args) {
	t = new Date(args.t)
    } else {
	t = new Date()
    }
    function $svgvc(id,dy) {
	var b=$id(id).getBoundingClientRect()
	var y = Number($attr(id,"y"))
	$attr(id,{y:(y+b.height/dy)})
    }
    function pad(n) {
	n=Number(n)
	if (n < 10) return "0"+n
	return ""+n
    }
    function pad2(n) {
	n=Number(n)
	if (n < 10) return "00"+n
	if (n < 100) return "0"+n
	return ""+n
    }
    var svg = SVG({id:"clock",style:{gridArea:"clock",position:"relative",top:"50%",transform:"translateY(-50%)"}},
		  SVGCircle({cx:50,cy:50,r:49,id:"ms",style:{fill:"#AEE0FF"}}),
		  SVGCircle({cx:50,cy:50,r:39,id:"second",style:{fill:"#AEE0FF"}}),
		  SVGCircle({cx:50,cy:50,r:29,id:"minute",style:{fill:"#AEE0FF"}}),
		  SVGCircle({cx:50,cy:50,r:19,id:"hour",style:{fill:"#AEE0FF"}}),
		  SVGLine({id:"hand1H"}),SVGLine({id:"hand1M"}),SVGLine({id:"hand1S"}),SVGLine({id:"hand1MS"}),
		  SVGLine({id:"hand2H"}),SVGLine({id:"hand2M"}),SVGLine({id:"hand2S"}),SVGLine({id:"hand2MS"}),
		  SVGCircle({cx:50,cy:50,r:2,id:"center",style:{fill:"white",strokeWidth:0.5}})
		 )
    
    var fs = "7vw", fs1=""
    var ret = Layout_Grid(
	{
	    cols:"18% 2% 18% 2% 18% 2% 22% 18%",
	    rows:"10% 80% 10%",
	    areas:'"cancel cancel X live live live Y accept" "clock clock clock clock clock clock clock clock" "H C1 M C2 S DOT MS AM"'
	},
	cancel = Button("Cancel",{class:"ORANGE RoundedT",style:{gridArea:"cancel"}}),
	live = Button("Live",{class:"GREEN",style:{gridArea:"live"}}),
	accept = Button("Accept",{class:"ORANGE RoundedT",style:{gridArea:"accept"}}),
	svg,
	H=Button("12",{id:"inH",class:"BLUE",style:{gridArea:"H",fontSize:fs}}),
	Button(":",{disabled:true,class:"WHITE",style:{gridArea:"C1",fontSize:fs,border:0,padding:0}}),
	M=Button("00",{id:"inM",class:"BLUE",style:{gridArea:"M",fontSize:fs}}),
	Button(":",{disabled:true,class:"WHITE",style:{gridArea:"C2",fontSize:fs,border:0,padding:0}}),
	S=Button("00",{id:"inS",class:"BLUE",style:{gridArea:"S",fontSize:fs}}),
	Button(".",{disabled:true,class:"WHITE",style:{gridArea:"DOT",fontSize:fs,border:0,padding:0}}),
	MS=Button("000",{id:"inMS",class:"BLUE",style:{gridArea:"MS",fontSize:fs}}),
	AM=Button("AM",{id:"inAM",class:"BLUE",style:{gridArea:"AM",fontSize:fs}}),
    )
    ret.style.minWidth = ret.style.minHeight = 0

    var selectHand = function(hand) {
	$id("in"+selectedHand).classList.remove("GREEN")
	$id("in"+selectedHand).classList.add("BLUE")
	selectedHand = hand
	$id("in"+selectedHand).classList.remove("BLUE")
	$id("in"+selectedHand).classList.add("GREEN")
    }
    
    H.onclicklist = [ ()=>selectHand("H") ]
    M.onclicklist = [ ()=>selectHand("M") ]
    S.onclicklist = [ ()=>selectHand("S") ]
    MS.onclicklist = [ ()=>selectHand("MS") ]
    AM.onclicklist = [ ()=>{
	if (AM.textContent == "AM") {
	    AM.textContent = "PM"
	} else {
	    AM.textContent = "AM"
	}
    } ]
    cancel.onclicklist = [ ()=>resolve(false) ]
    accept.onclicklist = [ ()=>{
	var h = parseInt($id("inH").textContent)
	var am = $id("inAM").textContent == "AM"
	if (h < 12 && !am) h += 12
	else if (h == 12 && am) h = 0
	t.setHours(h)
	t.setMinutes(parseInt($id("inM").textContent))
	t.setSeconds(parseInt($id("inS").textContent))
	t.setMilliseconds(parseInt($id("inMS").textContent))
	resolve(t)
    } ]
    live.onclicklist = [ ()=>{
	isLive = !isLive
 	if (isLive) {
	    requestAnimationFrame(updatelive)
	    live.textContent = "Stop"
	    live.classList.remove("GREEN")
	    live.classList.add("RED")
	} else {
	    live.textContent = "Live"
	    live.classList.remove("RED")
	    live.classList.add("GREEN")
	}
    } ]
    var handr,cr,x0,y0,svg_x0,svg_y0,svg_dx,svg_dy,start_val
    
    svg.ontouchstart = function(ev) {
	if (isLive) return
	//console.log("touchstart,",svg.ontouchmove);
	var P=polar(ev.touches[0].clientX,ev.touches[0].clientY)
	switch (selectedHand) {
	case "H": handr = 10; start_val = $id("inH").textContent; break
	case "M": handr = 22; start_val = $id("inM").textContent; break
	case "S": handr = 32; start_val = $id("inS").textContent; break
	case "MS": handr = 42; start_val = $id("inMS").textContent; 
	}
	sethand(selectedHand,ev.touches[0].clientX,ev.touches[0].clientY)
	console.log("touchstart done")
    }
    svg.ontouchmove = function(ev) {
	if (isLive) return
	sethand(selectedHand,ev.touches[0].clientX,ev.touches[0].clientY)
    }

    svg.ontouchend = function(ev) {
	var chg
	switch (selectedHand) {
	case "H":
	    if (start_val != $id("inH").textContent) {
		$id("inM").focus()
		$id("inM").click()
	    }
	    break
	case "M":
	    if (start_val != $id("inM").textContent) {
		$id("inS").focus()
		$id("inS").click()
	    }
	    break
	case "S":
	    if (start_val != $id("inS").textContent) {
		$id("inMS").focus()
		$id("inMS").click()
	    }
	    break
	case "MS": 
	    if (start_val != $id("inMS").textContent) {
		$id("inAM").focus()
		$id("inAM").click()
	    }
	    break
	}
    }
    svg.ontouchcancel = function(ev) { }
    
    // TO DO: save old handlers and restore when disposing of dialog
    document.ontouchstart = function() { }
    document.ontouchmove = function() { }
    
    var hand = function(name,degrees,len,w1,w2) {
	var angle = degrees * Math.PI / 180 - Math.PI/2
	//i = 11 // hour-1
	//angle = 2*Math.PI/12*i - Math.PI/2 + 2*Math.PI/12
	x2 = 50+len*Math.cos(angle)
	y2 = 50+len*Math.sin(angle)
	if (w1)	$replace("hand1"+name,SVGLine({id:name+"1",x1:50,y1:50,x2:x2,y2:y2,
				      style:{
					  strokeWidth:w1,
					  stroke:"black",
					  strokeLinecap:"round"
				      }}))
	if (w2) $replace("hand2"+name,SVGLine({id:name+"2",x1:50,y1:50,x2:x2,y2:y2,
				      style:{
					  strokeWidth:w2,
					  stroke:"white",
					  strokeLinecap:"round"
				      }}))    
    }
    var scr2svg = function(x,y) {
	var dx = x - svg_x0
	var dy = y - svg_y0
	dx = dx / svg_dx
	dy = dy / svg_dy
	return { x:dx, y:dy }
    }
    var polar = function(x,y) {
	var dx = x - x0
	var dy = y - y0
	var theta = Math.atan2(dy,dx)
	var xy = scr2svg(x,y)
	var dx0=xy.x-50, dy0=xy.y-50
	var len = Math.sqrt(dx0*dx0+dy0*dy0)
	return { r:len, a:theta, x:xy.x, y:xy.y }
    }
    var sethand = function(ahand,x,y) {
	var P=polar(x,y)
	var angle = P.a + Math.PI/2
	if (ahand == "H") {
	    P.a = Math.round(P.a / (Math.PI/6)) * (Math.PI/6)
	    angle = Math.round(angle / (Math.PI/6)) * (Math.PI/6)
	    H = Math.round(angle/ (Math.PI/6))
	    while (H <= 0) H += 12
	    $id("inH").textContent = pad(H)	    
	} else if (ahand == "M") {
	    var d,n
	    if (P.r < 29) {
		d = 6; n = 5
	    } else {
		d = 30; n = 1
	    }
	    P.a = Math.round(P.a / (Math.PI/d)) * (Math.PI/d)
	    angle = Math.round(angle / (Math.PI/d)) * (Math.PI/d)
	    M = Math.round(angle/ (Math.PI/d))*n
	    while (M < 0) M += 60
	    $id("inM").textContent = pad(M)
	} else if (ahand=="S") {
	    var d,n
	    if (P.r < 19) {
		d = 6; n = 5
	    } else {
		d = 30; n = 1
	    }
	    P.a = Math.round(P.a / (Math.PI/d)) * (Math.PI/d)
	    angle = Math.round(angle / (Math.PI/d)) * (Math.PI/d)
	    S = Math.round(angle/ (Math.PI/d))*n
	    while (S < 0) S += 60
	    $id("inS").textContent = pad(S)
	} else {
	    var d,n,tmp=0
	    if (P.r < 20) {
		d = 2; n = 250
	    } else if (P.r < 30) {
		tmp = Math.PI/2
		P.a -= tmp
		d = 5; n = 100
	    } else if (P.r < 40) {
		d = 50; n = 10
	    } else {
		d = 500; n = 1
	    }
	    P.a = Math.round(P.a / (Math.PI/d)) * (Math.PI/d)
	    P.a += tmp
	    angle = Math.round(angle / (Math.PI/d)) * (Math.PI/d)
	    MS = Math.round(angle/ (Math.PI/d))*n
	    while (MS < 0) MS += 1000
	    $id("inMS").textContent = pad2(MS)
	}
	var x2 = handr * Math.cos(P.a)+50
	var y2 = handr * Math.sin(P.a)+50
	$attr("hand1"+ahand,{x2:x2,y2:y2})
	$attr("hand2"+ahand,{x2:x2,y2:y2})
    }
    var update = function(t) {
	var inH = $id("inH")
	if (!inH) return false // form no longer exists
	var hour = t.getHours()
	var isAM
	if (hour < 12) {
	    hour++
	    isAM = true
	} else {
	    if (hour > 12) hour -= 12
	    isAM = false
	}
	var min = t.getMinutes()
	var sec = t.getSeconds()
	var millis = t.getMilliseconds()
	hand("H",30*hour,10,3.0,2.5)
	hand("M",6*min,22,2,1.5)
	hand("S",6*sec,32,1.5,1.0)
	hand("MS",360*(millis/1000),42,0.75,0.5)
	$id("inH").textContent = pad(hour)
	$id("inM").textContent = pad(min)
	$id("inS").textContent = pad(sec)
	$id("inMS").textContent = pad2(millis)
	$id("inAM").textContent = isAM ? "AM" : "PM"
	return true
    }
    var updatelive = function() {
	if (!isLive) return
	if (update(new Date())) requestAnimationFrame(updatelive)	
    }
    onElementLoad(svg,function() {
	var i
	var b0=svg.getBoundingClientRect()
	svg_x0 = b0.left
	svg_y0 = b0.top
	svg_dx = b0.width / 100
	svg_dy = b0.height / 100
	var dy=4*b0.height/100

	cr = $id("center").getBoundingClientRect()
	x0 = (cr.left+cr.right)/2
	y0 = (cr.top+cr.bottom)/2
	
	$id("in"+selectedHand).classList.remove("BLUE")
	$id("in"+selectedHand).classList.add("GREEN")
	$id("in"+selectedHand).focus()
	
	for (i=0;i<12;i++) { // hour numbers on face
	    angle = 2*Math.PI/12*i - Math.PI/2 + 2*Math.PI/12
	    y = 50+14*Math.sin(angle)
	    x = 50+14*Math.cos(angle)
	    $add(svg,SVGText({id:"hour"+i,
			      x:x,y:y,
			      style:{fontSize:"1vw",
				     textAnchor:"middle"}},i+1))
	    $svgvc("hour"+i,dy)
	}
	for (i=0;i<12;i++) { // minute numbers on face
	    angle = 2*Math.PI/12*i - Math.PI/2
	    y = 50+24*Math.sin(angle)
	    x = 50+24*Math.cos(angle)
	    $add(svg,SVGText({id:"minute"+i,
				  x:x,y:y,
				  style:{fontSize:"0.8vw",
					 textAnchor:"middle"}},pad(i*5)))
	    $svgvc("minute"+i,dy)
	}
	for (i=0;i<12;i++) { // second numbers on face
	    angle = 2*Math.PI/12*i - Math.PI/2
	    y = 50+34*Math.sin(angle)
	    x = 50+34*Math.cos(angle)
	    $add(svg,SVGText({id:"second"+i,
				  x:x,y:y,
				  style:{fontSize:"0.9vw",
					 textAnchor:"middle"}},pad(i*5)))
	    $svgvc("second"+i,dy)
	}
	for (i=0;i<60;i++) { // minute and second tick marks on face
	    if (i % 5 == 0) continue
	    angle = 2*Math.PI/60*i - Math.PI/2
	    x1 = 50+33*Math.cos(angle)
	    y1 = 50+33*Math.sin(angle)
	    x2 = 50+35*Math.cos(angle)
	    y2 = 50+35*Math.sin(angle)
	    $add(svg,SVGLine({x1:x1,y1:y1,x2:x2,y2:y2,style:{strokeWidth:0.2}}))
	    x1 = 50+23*Math.cos(angle)
	    y1 = 50+23*Math.sin(angle)
	    x2 = 50+25*Math.cos(angle)
	    y2 = 50+25*Math.sin(angle)
	    $add(svg,SVGLine({x1:x1,y1:y1,x2:x2,y2:y2,style:{strokeWidth:0.2}}))
	}
	
	for (i=0;i<100;i++) { // millisecond numbers and tick marks on face
	    var d = (i%10==0)?43:45
	    angle = 2*Math.PI/100*i - Math.PI/2
	    x1 = 50+d*Math.cos(angle)
	    y1 = 50+d*Math.sin(angle)
	    x2 = 50+50*Math.cos(angle)
	    y2 = 50+50*Math.sin(angle)
	    $add(svg,SVGLine({x1:x1,y1:y1,x2:x2,y2:y2,style:{strokeWidth:0.1}}))
	    if (i%10 == 0) {
		y = 50+42*Math.sin(angle)
		x = 50+42*Math.cos(angle)
		var n = "."+Math.round(i/10)
		$add(svg,SVGText({id:"millisecond"+i,
				      x:x,y:y,
				      style:{fontSize:"0.9vw",
					     textAnchor:"middle"}},
				     n))
		$svgvc("millisecond"+i,dy)	    
	    }
	}
	//requestAnimationFrame(updatelive)
	update(t)
    })
    return ret
}

function UserPasswordDialog(args,resolve,reject) {
    var go, cancel
    var id = args.id ? args.id : "UserPasswordDialog"
    var usertext = args.usertext ? args.usertext : "User"
    var passtext = args.passtext ? args.passtext : "Password"
    
    var ret = Layout_Screen(
	Layout_Grid(
	    {
		cols:"50% 50%",
		rows:"33% 33% 33%",
		areas:'"user_text user" "password_text password" "cancel go"'
	    },
	    Button(usertext,{disabled:"disabled",class:"TEXTBLACK",style:{gridArea:"user_text"}}),
	    Input({id:id+"_user",class:"GREEN",style:{gridArea:"user"}}),
	    Button(passtext,{disabled:"disabled",class:"TEXTBLACK",style:{gridArea:"password_text"}}),
	    Input({id:id+"_password",class:"BLUE",type:"password",style:{gridArea:"password"}}),
	    cancel=Button("Cancel",{class:"ORANGE",style:{gridArea:"cancel"}}),
	    go=Button("Submit",{class:"ORANGE",style:{gridArea:"go"}}),
	)
    )
    cancel.onclicklist = [ function() {
	resolve(false)
    } ]
    go.onclicklist = [ function() {
	var username = $value(id+"_user")
	var password = $value(id+"_password")
	resolve({user:username,password:password})
    } ]
    onElementLoad(id+"_user",()=>$id(id+"_user").focus())
    return ret
}

function BusyDialog(args,resolve,reject) {
    var ok
    var id = args.id ? args.id : "BusyDialog"
    var text = args.text ? args.text : "Please Standby..."
    var oldkeydown = document.onkeydown, oldactiveelement=document.activeElement
    document.onkeydown = function (t) {
	if(t.which == 9) return false
    }
    args.resolve = function() {
	document.onkeydown = oldkeydown
	if (oldactiveelement) oldactiveelement.focus()
	resolve()
    }
    var b,ret = Layout_Screen(
	Layout_Grid(
	    {
		cols:"25% 50% 25%",
		rows:"25% 50% 25%",
		areas:'"a b c" "d text f" "g h i"'
	    },
	    b=Button(text,{class:"TEXTBLACK",style:{gridArea:"text",border:"3vw solid yellow"}})
	), {id:id}
    )
    onElementLoad(id,()=>{
	$id(id).parentNode.style.backgroundColor=""
	b.focus()
	b.disabled="disabled"
    })
    return ret
}

function OkDialog(args,resolve,reject) {
    var ok
    var id = args.id ? args.id : "OkDialog"
    var text = args.text ? args.text : ""
    var oktext = args.yes ? args.yes : "Ok"

    var ret = Layout_Screen(
	Layout_Grid(
	    {
		cols:"50% 50%",
		rows:"66% 33%",
		areas:'"text text" "x ok"'
	    },
	    Button(text,{disabled:"disabled",class:"TEXTBLACK",style:{gridArea:"text"}}),
	    ok=Button(oktext,{id:id+"_ok",class:"ORANGE",style:{gridArea:"ok"}})
	)
    )
    ok.onclicklist = [ function() {
	resolve(true)
    } ]
    onElementLoad(id+"_ok",()=>$id(id+"_ok").focus())
    return ret
}

function OkCancelDialog(args,resolve,reject) {
    var ok, cancel
    var id = args.id ? args.id : "OkCancelDialog"
    var text = args.text ? args.text : "Proceed?"
    var oktext = args.yes ? args.yes : "Ok"
    var canceltext = args.no ? args.no : "Cancel"

    var ret = Layout_Screen(
	Layout_Grid(
	    {
		cols:"50% 50%",
		rows:"66% 33%",
		areas:'"text text" "ok cancel"'
	    },
	    Button(text,{disabled:"disabled",class:"TEXTBLACK",style:{gridArea:"text"}}),
	    ok=Button(oktext,{id:id+"_ok",class:"ORANGE",style:{gridArea:"ok"}}),
	    cancel=Button(canceltext,{class:"ORANGE",style:{gridArea:"cancel"}}),
	)
    )
    cancel.onclicklist = [ function() {
	resolve(false)
    } ]
    ok.onclicklist = [ function() {
	resolve(true)
    } ]
    onElementLoad(id+"_ok",()=>$id(id+"_ok").focus())
    return ret
}

function PromptDialog(args,resolve,reject) {
    var ok, cancel
    var id = args.id ? args.id : "PromptDialog"
    var text = args.text ? args.text : "Enter your choice:"
    var oktext = args.yes ? args.yes : "Ok"
    var canceltext = args.no ? args.no : "Cancel"

    var ret = Layout_Screen(
	Layout_Grid(
	    {
		cols:"50% 50%",
		rows:"33% 33% 33%",
		areas:'"text text" "input input" "ok cancel"'
	    },
	    Button(text,{disabled:"disabled",class:"TEXTBLACK",style:{gridArea:"text"}}),
	    Input({id:id+"_promptinput",class:"BLUE",style:{gridArea:"input",height:"33%",width:"100%"}}),
	    ok=Button(oktext,{id:id+"_ok",class:"ORANGE",style:{gridArea:"ok"}}),
	    cancel=Button(canceltext,{class:"ORANGE",style:{gridArea:"cancel"}}),
	)
    )
    cancel.onclicklist = [ function() {
	resolve(false)
    } ]
    ok.onclicklist = [ function() {
	resolve($value(id+"_promptinput"))
    } ]
    onElementLoad(id+"_ok",()=>$id(id+"_promptinput").focus())
    return ret
}

function HelpIntroDialog(args,resolve,reject) {
    var ok = Button("Dimiss Help",{class:"ORANGE"}), b=[], s={
	class:"BLUE",
	style:{width:"25%",height:"10%"}
    }, o = [ ]
    var h1 = {id:"h1",help:"When this button is clicked, an example 'Ok Dialog' will be displayed, allowing the user to click ok.  When the dialog is dismissed, text will appear next to the button indicating that the dialog has been run."}
    ok.onclicklist = [ ()=>resolve() ]
    var ret=Layout_Screen(
	WidgetScroller(
	    H1("Welcome to WebApp"),
	    P("The WebApp User Interface presents content in a uniform method."),
	    P("The first concept to learn is the ",I("screen"),".  All information is packaged into a format which will fit on your screen, regardless of its size. A key difference between a screen and a web ",I("page")," is that a screen remains fixed on your screen with various rectangular areas or ",I("panels")," to display the content.  The screen itself does not scroll, but content in any of these panels is scrollable as necessary.  Scroll buttons are often present around scrollable content: these are rounded at the top for the up scroller button and rounded at the bottom for the down scroller button and have a darker shade when scrolling in that direction is not possible.  You can also scroll using the arrow keys or page up and page down. (Note: If there are multiple scrollable areas you must change which area has the keyboard focus in order to change which text panel scrolls.) On a touch interface drag the content with your finger."),
	    P("There are various common interface elements which you can interact with.  The most common element is the ",I("Button"),".  A button is a rectangular element, sometimes with a rounded edge, which is displayed in a solid color with a narrow, differently colored border around it to separate is from other elements on the page.  Text in the button will indicate the purpose of the button.  Clicking on a button will cause it to perform its function.  A button can be clicked on directly with your pointer device such as the mouse, trackpad, trackpoint, etc. or even by tapping it with your finger if your have a touch sensitive display.  A button can also be clicked using the keyboard: The ",B("tab")," key advances the currently selected input element, usually denoted by a shaded oval shadow, while holding down the shift key while pressing tab retreats to the previous element.  When a button is selected, pressing the space bar functions the same as touching or clicking the mouse down on the button, while releasing the space bar functions the same as releasing the touch or mouse button to complete the click."),
	    P("The default color scheme uses ",Span("Orange",{class:"ORANGE"})," to denote movement functions such as scrolling or switching to other screens, ",Span("GREEN",{class:"GREEN"})," to denote buttons which do not disturb your place on the screen, and ",Span("BLUE",{class:"BLUE"})," for text input fields."),
	    P("A ",I("dialog")," is a special input state which overrides the current screen, obscuring its contents partially or completely.  Dialogs provide a way to select between available items or values, acknowledge or cancel certain actions and messages, and to indicate when the system is busy and cannot accept input.  You can click any of the buttons below to see an example dialog.  When the dialog pops up, make a selection where available to dismiss the dialog.  For the busy dialog, you must wait momentarily for the dialog to disappear on its own."),
	    b[0] = Button("Ok Dialog",s,h1),o[0] = Span(), Br(),
	    b[1] = Button("Ok / Cancel Dialog",s), o[1] = Span(), Br(),
	    b[2] = Button("User / Password Dialog",s), o[2] = Span(), Br(),
	    b[3] = Button("Calendar Dialog",s), o[3] = Span(), Br(),
	    b[4] = Button("Clock Dialog",s), o[4] = Span(), Br(),
	    b[5] = Button("Menu Dialog",s), o[5] = Span(), Br(),
	    P("In addition to this help screen you can get other kinds of help as well.  The Quick Reference provides a quick summary of how the interface works.  And you can always get help on the current screen in order to find out more information about what the purpose of the current screen is, what is expected for a particular input field, and what a particular button or other control will do when clicked.  You can also do a free-form search looking for a given piece of text in the help, or report an issue to the developers."),
	    {
		id:"gt1",
		scrollers: true,
		orientation:"v",
		footer: ok,
		//footer_h: "5%"
	    }
	))
    b[0].onclicklist = [ async ()=> {
	var ok = await appdialog(OkDialog,{text:"Click the Ok button"})
	o[0].textContent = "This dialog has been run"
    }]
    b[1].onclicklist = [ async ()=> {
	var ok = await appdialog(OkCancelDialog,{text:"Click one of the two buttons"})
	o[1].textContent = ok ? "Ok was clicked" : "Cancel was clicked"
    }]
    b[2].onclicklist = [ async ()=> {
	var ok = await appdialog(UserPasswordDialog,{usertext:"Name",passtext:"Favorite Color"})
	if (!ok) {
	    o[2].textContent = "Dialog was cancelled"
	} else {
	    o[2].textContent = `${ok.user}'s favorite color is reportedly ${ok.password}`
	}
    }]
    b[3].onclicklist = [ async ()=> {
	var ok = await appdialog(Calendar,{})
	if (!ok) {
	    o[3].textContent = "Dialog was cancelled"
	} else {
	    o[3].textContent = `Date entered: ${ok[1]}/${ok[2]}/${ok[3]}`
	}
    }]
    /* requires SVG
    b[4].onclicklist = [ async ()=> {
    var ok = await appdialog(Clock,{})
	if (!ok) {
	    o[4].textContent = "Dialog was cancelled"
	} else {
	    o[4].textContent = `Time entered: ${ok}`
	}
    }]
    */
    b[5].onclicklist = [ async ()=> {
	var ok = await appdialog(ChoiceList,{choices:[
	    "First Choice",
	    "Second Choice",
	    "Third Choice",	    
	    "Fourth Choice",	    
	    "Fifth Choice",	    
	    "Sixth Choice",	    
	    "Seventh Choice",	    
	    "Eighth Choice",	    
	    "Ninth Choice"
	],cancel:true,h:"20%"})
	if (!ok) {
	    o[5].textContent = "Dialog was cancelled"
	} else {
	    o[5].textContent = `${ok[0]} was selected`
	}
    }]
    
    return ret
}

function HelpReferenceDialog(args,resolve,reject) {
    var ok = Button("Dimiss Help",{class:"ORANGE"})
    ok.onclicklist = [ ()=>resolve() ]
    var ret=Layout_Screen(
	WidgetScroller(
	    H1("WebApp Quick Reference"),
	    {
		id:"gt1",
		scrollers: true,
		orientation:"v",
		footer: ok,
		//footer_h: "5%"
	    }
	))

    return ret
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
var EventChangeLog = [ ]
var EventChangeRecording

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
    if (EventChangeRecording) {
	EventChangeLog.push({me:me,id:me.id,op:"Change",value:$value(me),t:new Date()})
    }
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

function EventButton(me,event,name) {
    var i,handlers = me.getAttribute(`on${name}list`)
    if (handlers) {
	handlers = handlers.split(",")
	for (i=0;i<handlers.length;i++) {
	    var f = window[handlers[i]]
	    if (typeof(f) == "function") f(me,event)
	}
    } else {
	handlers = me[`on${name}list`]
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
    event.stopPropagation()
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
    if ((event.key == " " || event.key == "Space" || id)
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
    if ((event.key == " " || event.key == "Space" || id)
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

function EventPointerDownButton(me,event) {
    if (me.getAttribute("value") != "true") {
	me.setAttribute("value","true")
	EventChangeButton(me,event)
    }
    EventButton(me,event,"pointerdown")
}

function EventPointerUpButton(me,event) {
    if (me.getAttribute("value") != "false") {
	me.setAttribute("value","false")
	EventChangeButton(me,event)
    }
    EventButton(me,event,"pointerup")
}

// User Interface (input) elements
// Button, Input, Select, TextArea

function Button() {
    var xz = document.createElement("button")
    $add(xz,arguments)
    appWidgetCount++
    if (!xz.id) xz.id = "widget"+appWidgetCount
    // buttons created disabled don't get a tab order
    if (!xz.disabled) $attr(xz,{tabindex:(""+(++GlobalTabIndex))})
    xz.setAttribute("value","false")
    xz.setAttribute("onkeydown","EventKeyDownButton(this,event)")
    xz.setAttribute("onkeyup","EventKeyUpButton(this,event)")
    xz.setAttribute("onmousedown","EventMouseDownButton(this,event)")
    xz.setAttribute("onmouseup","EventMouseUpButton(this,event)")
    xz.setAttribute("onpointerdown","EventPointerDownButton(this,event)")
    xz.setAttribute("onpointerup","EventPointerUpButton(this,event)")
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
/*
There is a bug in this code if the text wraps lines, because if we get a span that wraps lines our coordinate comparisons
will potentially be incorrect. We may have to use ranges, or even a couple of function which may perform this operation for us.
*/
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
	if (txt2.length > 1) {
	    ret=txt1.length+FindPointInText(x,y,span2.firstChild)
	} else { // nothing in span2, so click is at end of text
	    ret=txt2.length // -1 ???
	}
    } // else... should not reach here, click wasn't in either span!
    $replace(span0,txt)
    return ret
}

var FindPointInText2
if (document.caretRangeFromPoint) {
    FindPointInText2 = function(x,y) {
	range = document.caretRangeFromPoint(x,y)
	return {
	    node:range.startContainer,
	    offset:range.startOffset
	}
    }
} else if (document.caretPositionFromPoint) {
    FindPointInText2 = function(x,y) {
	range = document.caretPositionFromPoint(x,y)
	return {
	    node:range.offsetNode,
	    offset:range.offset
	}
    }
} else {
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
    f($id(elem))
}

	
function $StatusUpdate(ob,color,msg) {
    ob = (typeof ob == "string") ? document.getElementById(ob) : ob
    if (ob) {
	ob.style.backgroundColor=color
	ob.textContent = msg
    }
    return ob
}

var fetchNum=0
/*
  fetch wrapped with:
  1. the ability to cancel in flight fetches when screen is about to be unloaded
  2. automatic decoding of the response
  3. use app status button(s) to denote status of the request
  4. 401 status triggers login dialog

  args is an object which may contain the following keys in addition to the options to fetch():
  
  init: function to call before entering fetch
  cleanup: function to call after fetch returns
  status1: text to display in AppStatus1 while request is in flight
  status2: text to display in AppStatus2 while request is in flight
  status3: text to display in AppStatus3 while request is in flight
  format: string naming the response function to await call to decode the reply
  login: boolean indicating whether or not a 401 status will trigger the login dialog
*/
async function fetchOrDie(url,args) {
    var init, cleanup, status1, status2, status3, AppStatus1, AppStatus2, AppStatus3
    if (args && args.init) {
	init = args.init
	delete args.init
    }
    if (args && args.cleanup) {
	cleanup = args.cleanup
	delete args.cleanup
    }
    if (args && args.status1) {
	status1 = args.status1
	delete args.status1
	AppStatus1 = $StatusUpdate("AppStatus1","yellow",status1)
    }
    if (args && args.status2) {
	status2 = args.status2
	delete args.status2
	AppStatus2 = $StatusUpdate("AppStatus2","yellow",status2)
    }
    if (args && args.status3) {
	status3 = args.status3
	delete args.status3
	AppStatus3 = $StatusUpdate("AppStatus3","yellow",status3)
    }
    if (init) init()
    while (true) {
	try {
	    const controller = new AbortController()
	    var name = "fetch"+(++fetchNum)
	    screen_abort_add(name,function() {
		controller.abort()
	    })
	    var format, login
	    if (args && args.login) {
		login = args.login
		delete args.login
	    }
	    if (args && args.format) {
		format = args.format
		delete args.format
	    }
	    var ret = await fetch(url, { ...args, signal:controller.signal })
	    $StatusUpdate(AppStatus1,"","")
	    $StatusUpdate(AppStatus2,"","")
	    $StatusUpdate(AppStatus3,"","")
	    screen_abort_remove(name)
	    //console.log("fetch returning ",ret)
	    if (ret.status == 401 && login) {
		if (cleanup) cleanup()
		await Login()
		if (init) init()
	    } else {
		if (format) ret.data = await ret[format]()
		if (cleanup) cleanup()
		return ret
	    }
	} catch (e) {
	    var txt
	    if (e.message == "NetworkError when attempting to fetch resource.") { // e.name == "TypeError"
		txt = "Network Error.  Please try again or contact your supervisor"
	    } else if (e.name == "AbortError") {
		return false
	    } else {
		txt = "Please contact your supervisor to report this error: "+e.name+":"+e.message
	    }
	    if (cleanup) cleanup()
	    $StatusUpdate(AppStatus1,"red","")
	    $StatusUpdate(AppStatus2,"red","")
	    $StatusUpdate(AppStatus3,"red","")
	    await appdialog(OkDialog,{text:txt})
	    return false
	}
    }
}
