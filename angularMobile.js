(function(){
//data-controller   $scope
//data-repeat       $scope
//data-app          $scope
//data-model        $input
//data-bind         $output
//data-attr-*       $output
//data-evt-*        $output
//data-repeat-index $repeat sign

var $watchTree   = {},
injector    =   {
    invoke: function(target) {
        if(target.$inject){
            var args = target.$inject; 
        }else{
            var FN_ARGS         = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
                FN_ARG_SPLIT    = /,/,
                FN_ARG          = /^\s*(_?)(\S+?)\1\s*$/,
                STRIP_COMMENTS  = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
                text            = target.toString(),
                args            = text.match(FN_ARGS)[1].split(',');
        }
        
        target.apply(target, this.getDependencies(args));
    },
    getDependencies: function(arr) {
        var dependecies = services,
            newArr      = [],
            i;
        for(i =0 ; i<arr.length; i++){
            newArr.push(dependecies[arr[i]]); 
        }
        return newArr;
    },
    register: function(name, dependency) {
        services[name] = dependency;
    }
},
services = {
    "$rootElement"  : document,
    "$watchTree"    : {},
    "$scope"        : {
        dom     : document,
        data    : {},
        parent  : null,
        children: []
    },
    "$http" : function(config) {
        //console.log('$http');
        var success = function(){},
            obj = {
                "success" : function(func){
                    success = func; 
                }
            }
        if(typeof window.XMLHttpRequest === 'undefined' &&
            typeof window.ActiveXObject === 'function') {
            window.XMLHttpRequest = function() {
                try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
                try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
                return new ActiveXObject('Microsoft.XMLHTTP');
            };
        };
        
        var url         = config.url || '',
            dataType    = config.dataType ? config.dataType.toUpperCase() : 'TEXT', 
            type        = config.type ? config.type.toUpperCase() : 'GET', 
            data        = config.data || null,
            xhr         = new XMLHttpRequest,
            response;
        xhr.open( type, url, true );
        if(data) xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState != 4) return;
            if (xhr.status != 200 && xhr.status != 304) {
                return;
            }
            response    = xhr.responseText;
            switch(dataType.toLowerCase()){
                case "json":
                    //console.log('json')
                    if (typeof(JSON) == 'undefined'){  
                         resonse = eval("("+response+")"); //ugly 
                    }else{  
                         response = JSON.parse(response);  
                    }  
                break;
            }
            success(response);
        }
        if (xhr.readyState == 4) return;
        xhr.send(data);
        return obj;
    }, 
    "$resource" : function(){//

    },
    "$controller" : {}
}, directives = {
    "data-model": function(value, $watchTree, $scope) {
        var data = $watchTree,
            pathArr,j,pathArrj,item,nodes,node;
        
        var change = function(){
            pathArr = value.split(".");
            for (j = 0; j < pathArr.length; j++) {
                pathArrj    = pathArr[j];
                item        = data[pathArrj];
                if(!item){
                    break;
                }else{
                    data = data[pathArrj];
                }
            }
            nodes   = data.$nodes;
            for(i = 0; i<nodes.length; i++){
                node    = nodes[i];
                node.node.nodeValue = this.value; 
            }
        };

        this.onkeyup    = change;
        this.onkeydown  = change;
        this.onchange   = change;
    },
    "data-attr-(.*)": function(template, $watchTree, $data, param) {
        var valArr = template.split(/({{.+?}})/gim);
        if (valArr.length <= 1) return;
        var tree        = $watchTree, 
            data        = $data,
            has         = false,
            paths       = [],
            i, j, pathArr, textNode, template, pathArrj;

        while (valArr.length > 0) {
            if( /{{(.*?)}}/gim.test( (valArr.shift() || "") ) ) {
                template    = RegExp.$1;
                pathArr     = template.split(".");
                paths.push(template);
                for (j = 0; j < pathArr.length; j++) {
                    pathArrj    = pathArr[j];
                    tree[pathArrj] || (tree[pathArrj] = {});
                    tree    = tree[pathArrj];
                    data[pathArrj] && (data = data[pathArrj]);
                }
                var attrNode    = document.createAttribute(param);
                attrNode.nodeValue  = data;
                this.setAttributeNode(attrNode);
                tree.$nodes || (tree.$nodes = []); 
                tree.$nodes.push({"template": template,"node": attrNode});
            }
        }
    },
    "data-evt-(.*)": function(value, $watchTree, $data, evt) {
        var valArr = value.split(/({{.+?}})/gim);
        if (valArr.length <= 1) return;

        while (valArr.length > 0) {
            if( /{{(.*?)}}/gim.test( (valArr.shift() || "") ) ) {
                var funcArr  = RegExp.$1.split('.'),
                    func     = $data,
                    func,i;
                for(i=0; i < funcArr.length; i++){
                    funcArri = funcArr[i];
                    func[funcArri] && (func = func[funcArri]);
                }
                if(typeof(func)=="function"){
                    switch(evt){
                        case "swipe"    : 
                            var coor    = {
                                "touch"     : { 
                                    "previous"  : {
                                        "x" : 0,
                                        "y" : 0 
                                    },
                                    "current"   : {
                                        "x" : 0,
                                        "y" : 0 
                                    },
                                    "start"     : {
                                        "x" : 0, 
                                        "y" : 0 
                                    }
                                },
                                "element"   : {
                                    "start"     : {
                                        "x" : 0, 
                                        "y" : 0 
                                    },
                                    "current"   : {
                                        "x" : 0, 
                                        "y" : 0 
                                    } 
                                }
                            },
                            touch   = coor.touch,
                            touchStart  = touch.start,
                            touchPrev   = touch.previous,
                            touchCurr   = touch.current,
                            element     = coor.element,
                            eleStart    = element.start,
                            eleCurr     = element.current;

                            this.style.webkitTransform = "translateZ(0)";
                            this.style.left = "0px";
                            this.addEventListener('touchstart', function(e){
                                //console.log('touchstart') 
                                touchPrev.x = touchCurr.x   = touchStart.x  = e.touches[0].pageX;
                                touchPrev.y = touchCurr.y   = touchStart.y  = e.touches[0].pageY;
                                eleCurr.x   = eleStart.x    = Number(this.style.left.replace('px',''));
                                eleCurr.x   = eleStart.y    = Number(this.style.top.replace('px',''));
                            },  false);
                            this.addEventListener('touchmove', function(e){
                                //console.log('touchmove') 
                                touchCurr.x = e.touches[0].pageX,
                                touchCurr.y = e.touches[0].pageY;
                                if( touchCurr.x != touchPrev.x || touchCurr.x != touchPrev.y){
                                    func.call(this, e, coor);
                                }
                                touchPrev.x   = touchCurr.x;
                                touchPrev.y   = touchCurr.y;
                            }, false);
                        break;
                        /*case "click" :
                            var move = false 
                            this.addEventListener('touchend', function(e){
                                if(!move){
                                    func.call(this, e); 
                                } 
                            });

                            this.addEventListener('touchmove', function(e){
                                move = true;
                            });
                        break;*/
                        default : 
                            //console.log(this.className)
                            if (this.addEventListener) {
                                this.addEventListener(evt, func, false);
                            } else if (elem.attachEvent) {
                                this.attachEvent("on" + evt, func);
                            } else { 
                                this[evt] = func;
                            }
                        break; 
                    }
                }
            }
        }

    }
},  $compile = function(node, $watchTree, $data, $scope) {
    if (node.tagName == "SCRIPT") return;
    if (node.nodeType == 1) {
        //ELEMENT_NODE
        var attributes = node.attributes, 
            i, attribute, attrName, attrValue, key, controller;

        //data-controller
        if ((controller = node.getAttribute("data-controller"))) {
            //$watchTree
            services.$watchTree[controller]  || (services.$watchTree[controller]  = {});
            var $watchTree  = services.$watchTree[controller];
            //$scope 
            injector.invoke(services.$controller[controller] || window[controller]);
            var $data   = services.$scope;
        };

        //data-repeat
        if( /(\w*) +in +(\w*)/gim.test( node.getAttribute("data-repeat") ) ){ 
            var key     = RegExp.$1,
                R$2     = RegExp.$2,
                pathArr = R$2.split('.'),
                tree    = $watchTree,
                i,j,item,pathArri,tempNode,tempTree;
            //$watchTree 
            for (i = 0; i < pathArr.length; i++) {
                pathArri    = pathArr[i];
                tree[pathArri] || (tree[pathArri] = {});
                tree = tree[pathArri];
            }
            tree.$repeat || (tree.$repeat = []); 
            var $watchTree    = {"$nodes": [node]};
            tree.$repeat.push($watchTree);
            
            var repeatData  = $data[R$2];
            if(repeatData){ 
                var len         = $data[R$2].length,
                    tempData    = {},
                    index;
                if (index = node.getAttribute("data-repeat-index")){
                    tempData[key]   = repeatData[Number(index)];
                    var $data       = tempData;
                }else{
                    tempData[key]   = repeatData[0];
                    var $data       = tempData;
                    for(i = len-1; i>0; i--){
                        tempNode = node.cloneNode(true);
                        tempNode.setAttribute('data-repeat-index',i);
                        node.parentNode.insertBefore(tempNode, node.nextSibling);
                    }
                }
            }
        }
        //data-other no $watchTree modify
        for (i = 0; i < attributes.length; i++) {
            attribute = attributes[i], attrName = attribute.nodeName, attrValue = attribute.nodeValue;
            for (key in directives) {
                if (new RegExp(key, "gim").test(attrName)) {
                    var R = RegExp;
                    directives[key].call(node, attrValue, $watchTree, $data, R.$1, R.$2, R.$3, R.$4, R.$5, R.$6, R.$7, R.$8, R.$9);
                }
            }
        }
    } else if (node.nodeType == 3) {
        //TEXT_NODE
        var valArr = node.nodeValue.split(/({{.+?}})/gim);
        if (valArr.length <= 1) return;
                
        while (valArr.length > 0) {
            var tree        = $watchTree,
                data        = $data,
                has         = false,
                RegExp$1,i, j, val, pathArr, textNode, template, pathArrj, item, len;

            val = valArr.shift() || "";
            if (has = /{{(.*?)}}/gim.test(val)) {
                pathArr = RegExp.$1.split(".");
                len     = pathArr.length;
                for (j = 0; j < len; j++) {
                    pathArrj    = pathArr[j];
                    tree[pathArrj] || (tree[pathArrj] = {});
                    tree = tree[pathArrj];
                    data[pathArrj] && (data = data[pathArrj]);
                    j>=len-1 && (val = data);
                }
            }
            if (valArr.length > 0) {
                textNode = node.cloneNode(false);
                node.parentNode.insertBefore(textNode, node);
            } else {
                textNode = node;
            }
            textNode.nodeValue = val;
            if (has) {
                tree.$nodes || (tree.$nodes = []); 
                tree.$nodes.push({"template": val, "node": textNode});
            }
        }
    }
    //children	
    var child = node.firstChild;
    while (child) {
        $compile(child, $watchTree, $data, $scope);
        child = child.nextSibling;
    }
};

/*!
* domready (c) Dustin Diaz 2012 - License MIT
*/
var domready = (function (ready) {

  var fns = [], fn, f = false
    , doc = document
    , testEl = doc.documentElement
    , hack = testEl.doScroll
    , domContentLoaded = 'DOMContentLoaded'
    , addEventListener = 'addEventListener'
    , onreadystatechange = 'onreadystatechange'
    , readyState = 'readyState'
    , loadedRgx = hack ? /^loaded|^c/ : /^loaded|c/
    , loaded = loadedRgx.test(doc[readyState])

  function flush(f) {
    loaded = 1
    while (f = fns.shift()) f()
  }

  doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
    doc.removeEventListener(domContentLoaded, fn, f)
    flush()
  }, f)


  hack && doc.attachEvent(onreadystatechange, fn = function () {
    if (/^c/.test(doc[readyState])) {
      doc.detachEvent(onreadystatechange, fn)
      flush()
    }
  })

  return (ready = hack ?
    function (fn) {
      self != top ?
        loaded ? fn() : fns.push(fn) :
        function () {
          try {
            testEl.doScroll('left')
          } catch (e) {
            return setTimeout(function() { ready(fn) }, 50)
          }
          fn()
        }()
    } :
    function (fn) {
      loaded ? fn() : fns.push(fn)
    })
})();

/**/

domready(function(){
//    exports.init  = function(ctrls){
        //services['$controller'] = (new ctrls()).controllers;
        $compile(services.$rootElement, services.$watchTree, services.$scope);
//    } 
});

})();
