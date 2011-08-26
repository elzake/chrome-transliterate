google.load("elements", "1", {
    packages: "transliteration" });
google.load("language", "1");

var editfun;

function output(o,info,tabs) {
    var t = o.transliterations && o.transliterations.length > 0
            ? o.transliterations.map(function(d) {
                if (d.transliteratedWords && d.transliteratedWords.length > 0)
                    return d.transliteratedWords[0];
            }) : [];
    if (editfun) {
        editfun( {editable: info.editable, data: t.join(' ') } );
    }
    //console.log( t, info, tabs );
}

chrome.extension.onRequest.addListener(function(msg,sender,response) {
    editfun = response;
});

function camelize(s) {
    return s.substr(0,1).toLocaleUpperCase()
         + s.substr(1).toLocaleLowerCase()
}

window.onload = function() {
    var lc = google.elements.transliteration.LanguageCode,
        def = localStorage['default-lang'] || "hi";

    var lcr = (function(lc) {
        var o = {};
        for (var k in lc)
            o[lc[k]] = camelize(k);
        return o;
    })(lc);

    var ctxs = ["selection","editable"];

    var default_lang = chrome.contextMenus.create({
        title: "Transliterate to " + lcr[def],
        contexts: ctxs,
        onclick: function(info,tabs) {
            google.language.transliterate(info.selectionText.split(/\s/), "en", localStorage['default-lang'] || "hi", function(r) {
                output(r,info,tabs);
            });
        }
    });

    localStorage['menu-id'] = default_lang;

    var sub_langs = chrome.contextMenus.create({
        title:"Transliterate to", contexts: ctxs });

    for (var k in lc) {
        (function(ek,v){
            chrome.contextMenus.create({
                title: ek,
                parentId: sub_langs,
                contexts: ctxs,
                onclick: function(info,tabs) {
                    var f = function(info,tabs) {
                        google.language.transliterate(info.selectionText.split(/\s/), "en", v, function(r) {
                            output(r,info,tabs);
                        });
                    };
                    chrome.contextMenus.update(default_lang, {
                        title: "Transliterate to " + lcr[v],
                        onclick: f
                    });
                    f(info,tabs);
                }
            });
        })(camelize(k),lc[k]);
    }
}
