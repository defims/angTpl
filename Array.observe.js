;(function(window, document, undefined){
    /*
     *  =walkDocumentTree
     *  @callback   {function}
     * */
    function walkDocumentTree(callback){
        var allElements =   'all' in document ?
                            document.all :
                            allElements = document.getElementByTagName('*'),
            len         = allElements.length,
            i;
        for(i=0; i<len; i++) callback(allElements[i]);
    }
    /**/
    /*
     *  =bootstrap
     *
     * */
    var attachEvent = 'attachEvent',
        addEventListener = 'addEventListener',
        readyEvent = 'DOMContentLoaded';
    if( !document[addEventListener] )
        addEventListener =  document[attachEvent]
                            ? (readyEvent = 'onreadystatechange') && attachEvent
                                : '';
    window['domReady'] = function(f) {
        /in/.test(document.readyState)
            ? !addEventListener
                ? setTimeout(function() { window['domReady'](f); }, 9)
                : document[addEventListener](readyEvent, f, false)
            : f();
    };
    domReady(function(){
        walkDocumentTree(function(element){
            var attributes  = element.attributes,
                attrLen     = attributes.length,
                attribute,attrName;
            while(attrLen--){
                attribute   = attributes[attrLen];
                attrName    = attribute.nodeName,
                attrValue   = attribute.nodeValue;
                if(attrValue.match(/\{\{.*?\}\}/gim)){
                    if(attrName.match(/data-attr-(.*)/gim)){//attributes
                        ElementBind(element, 'attributes.'+RegExp.$1.replace('-','.'), attrValue);
                    }else if(attrName.match(/data-evt-(.*)/gim)){//event
                        ElementBind(element, 'event.'+RegExp.$1.replace('-','.'), attrValue);
                    }else if(attrName.match(/data-dataset-(.*)/gim)){//dataset
                        ElementBind(element, 'dataset.'+RegExp.$1.replace('-','.'), attrValue);
                    }else if(attrName.match(/data-repeat/gim)){//repeat
                        ElementBind(element, 'repeat', attrValue);
                    }else if(attrName.match(/data-scope/gim)){//scope
                        ElementBind(element, 'scope', eval(attrValue));
                    }
                }
            }

            //textContent
            var childNodes  = element.childNodes,
                nodeLen     = childNodes.length,
                childNode;
            while(nodeLen--){
                childNode   = childNodes[nodeLen];
                if(childNode.nodeType == 3 && childNode.nodeValue.match(/\{\{.*?\}\}/gim))//textNode
                    ElementBind(element, 'textContent', childNode.nodeValue)
            }
        })
    });
    /**/
})(window, document);
