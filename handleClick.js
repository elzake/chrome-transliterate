var selectedElement;

window.addEventListener('contextmenu', function(e) {
    chrome.extension.sendRequest( 'gettrans', function(data) {
        console.log(e.target, data);
        if (data.editable) {
            e.target.value = data.data;
        } else {
            var r = window.getSelection().getRangeAt(0);
            r.deleteContents();
            r.insertNode( document.createTextNode(data.data) );
        }
    } );
});
