(function(){

//data-controller   $scope
//data-repeat       $scope
//data-app          $scope
//data-model        $input
//data-bind         $output
//data-attr-*       $output
//data-evt-*        $output
//data-repeat-index $repeat sign

var addEvent = function(evnt, elem, func) {
    if (elem.addEventListener) {
        // W3C DOM
        elem.addEventListener(evnt, func, false);
    } else if (elem.attachEvent) {
        // IE DOM
        elem.attachEvent("on" + evnt, func);
    } else {
        // No much to do
        elem[evnt] = func;
    }
    }, $eval = function(template, value) {
    var valArr = template.split(/({{.+?}})/gim), i, j, val, pathArr, data = value;
    for (i = 0; i < valArr.length; i++) {
        val = valArr[i] || "";
        if (/{{(.*?)}}/gim.test(val)) {
            pathArr = RegExp.$1.split(".");
            for (j = 0; j < pathArr.length; j++) {
                data = data[pathArr[j]];
                if (!data) {
                    data = "";
                    break;
                }
            }
            valArr[i] = data;
        }
    }
    return valArr.join("");
}, services = {
    "$rootElement" : document, 
    "$rootScope" : {
        dom: [ document ],
        parent: "",
        scope: {},
        binds: [],
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

    }
}, directives = {
    "data-bind": function(value, $scope) {
        var node;
        if (this.firstChild) {
            node = this.firstChild;
        } else {
            node = document.createTextNode();
            this.appendChild(node);
        }
        node.nodeValue = $eval(value, $scope.scope);
        $scope.binds.push({
            node: node,
            scope: $scope.scope,
            template: value
        });
    },
    "data-model": function() {},
    "data-attr-(.*)": function(value, $scope, param) {
        var attr = document.createAttribute(param);
        attr.value = $eval(value, $scope.scope);
        $scope.binds.push({
            node: attr,
            scope: $scope.scope,
            template: value
        });
        this.setAttributeNode(attr);
    },
    "data-evt-(.*)": function(value, $scope, evt) {
        var scope = $scope, func;
        while (!(func = scope.scope[value])) {
            scope = scope.parent;
        }
        //console.log(func)
        addEvent(evt, this, func);
    }
}, textNode = function(node, $scope) {
    var valArr = node.nodeValue.split(/({{.+?}})/gim);
    if (valArr.length <= 1) return;
    var parentNode = node.parentNode, data = $scope.scope, len = valArr.length, has = false, i, j, val, pathArr, textNode, template;
    while (valArr.length > 0) {
        val = valArr.shift() || "";
        has = /{{(.*?)}}/gim.test(val);
        if (has) {
            template = RegExp.$1;
            pathArr = template.split(".");
            for (j = 0; j < pathArr.length; j++) {
                data = data[pathArr[j]];
                if (!data) {
                    data = "";
                    break;
                }
            }
            val = data;
        }
        if (valArr.length > 0) {
            textNode = node.cloneNode(false);
            textNode.nodeValue = val;
            parentNode.insertBefore(textNode, node);
        } else {
            textNode = node;
            textNode.nodeValue = val;
        }
        if (has) $scope.binds.push({
            node: textNode,
            scope: $scope.scope,
            template: "{{" + template + "}}"
        });
    }
}, buildScope = function(node, $scope) {
    if (node.tagName == "SCRIPT") return;
    if (node.nodeType == 1) {
        //ELEMENT_NODE
        var attributes = node.attributes, i, attribute, attrName, attrValue, key;
        //data-controller
        if (attrValue = node.getAttribute("data-controller")) {
            var scope = {}, child, dependency, dependencies, i;
            //get controller
            /*DI*
            if(/\((.*?)\)/gim.test(window[attrValue].toString())){
                dependencies  = RegExp.$1.replace(' ','').split(',');
                for(i = 0; i<dependencies.length; i++){
                    dependency  = dependencies[i];
                }
            }
            **/
            window[attrValue](scope,services.$http);

            //console.log(scope);
            child = {
                dom: [ node ],
                scope: scope,
                binds: [],
                parent: $scope,
                children: [],
                events: []
            };
            $scope.children.push(child);
            var $scope = child;
        }
        //data-repeat
        if (attrValue = node.getAttribute("data-repeat")) {
            if (/(\w*) +in +(\w*)/gim.test(attrValue)) {
                var scope = $scope.scope[RegExp.$2], child = {
                    dom: [ node ],
                    scope: {},
                    binds: [],
                    parent: $scope,
                    children: []
                };
                if (index = node.getAttribute("data-repeat-index")) {
                    child.scope[RegExp.$1] = scope[Number(index)];
                } else {
                    for (i = scope.length - 1; i > 0; i--) {
                        tempNode = node.cloneNode(true);
                        tempNode.setAttribute("data-repeat-index", i);
                        node.parentNode.insertBefore(tempNode, node.nextSibling);
                    }
                    node.setAttribute("data-repeat-index", 0);
                    child.scope[RegExp.$1] = scope[0];
                }
                $scope.children.push(child);
                //console.log(child);
                var $scope = child;
            }
        }
        //data-other no $scope modify
        for (i = 0; i < attributes.length; i++) {
            attribute = attributes[i], attrName = attribute.nodeName, attrValue = attribute.nodeValue;
            for (key in directives) {
                if (new RegExp(key, "gim").test(attrName)) {
                    var R = RegExp;
                    directives[key].call(node, attrValue, $scope, R.$1, R.$2, R.$3, R.$4, R.$5, R.$6, R.$7, R.$8, R.$9);
                }
            }
        }
    } else if (node.nodeType == 3) {
        //TEXT_NODE
        textNode(node, $scope);
    }
    //children	
    var child = node.firstChild;
    while (child) {
        buildScope(child, $scope);
        child = child.nextSibling;
    }
};
/*!
* domready (c) Dustin Diaz 2012 - License MIT
*/
!function(e,t){typeof module!="undefined"?module.exports=t():typeof define=="function"&&typeof define.amd=="object"?define(t):this[e]=t()}("domReady",function(e){function p(e){h=1;while(e=t.shift())e()}var t=[],n,r=!1,i=document,s=i.documentElement,o=s.doScroll,u="DOMContentLoaded",a="addEventListener",f="onreadystatechange",l="readyState",c=o?/^loaded|^c/:/^loaded|c/,h=c.test(i[l]);return i[a]&&i[a](u,n=function(){i.removeEventListener(u,n,r),p()},r),o&&i.attachEvent(f,n=function(){/^c/.test(i[l])&&(i.detachEvent(f,n),p())}),e=o?function(n){self!=top?h?n():t.push(n):function(){try{s.doScroll("left")}catch(t){return setTimeout(function(){e(n)},50)}n()}()}:function(e){h?e():t.push(e)}});
;
domReady(function(){
    buildScope(services.$rootElement, services.$rootScope);
    console.log(services.$rootScope)
});
})();
