/*
 * Object.definePropery polyfill
 * this polyfill will use VBScript for pure object in ie6,ie7,ie8
 * like https://github.com/defims/avalon/blob/master/avalon.js#L1378
 * 
 */
;(function(){
if (Object.prototype.__defineGetter__ && !Object.defineProperty) {//__defineGetter__
   Object.defineProperty=function(obj,prop,desc) {
      if ("get" in desc) obj.__defineGetter__(prop,desc.get);
      if ("set" in desc) obj.__defineSetter__(prop,desc.set);
   }
}else{
    function doesDefinePropertyWorkOn(obj) {
        try {
            Object.defineProperty(obj, "x", {});
            return "x" in object;
        } catch (e) {
            // returns falsy
        }
    }
    var definePropertyWorksOnObject = doesDefinePropertyWorkOn({}),
        definePropertyWorksOnDom    = typeof document == "undefined" || doesDefinePropertyWorkOn(document.createElement("div"));
    if(!definePropertyWorksOnObject && window.VBArray){//defineProperty works failed on pure object such as ie8
        //use VBscript class
        //document.write('ie6 ie7 ie8');
        //getOwnPropertyDescriptor needed
        //building...
    }else if(!definePropertyWorksOnDom){//webkit dom defineProperty polyfill
        //getOwnPropertyDescriptor
        //building...
    }/*else{
        //document.write('modern'); 
        console.log('mordern')
    }*/
}
})();
