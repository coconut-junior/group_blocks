var doc = app.activeDocument;
var pages = doc.pages;

var tolerance = 10; //in pixels

app.activeDocument.groups.everyItem().ungroup(); //ungroup everything

if(doc.viewPreferences.horizontalMeasurementUnits == MeasurementUnits.inches) {
    tolerance = 0.2;
}
else if(doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.pixels){
    tolerance = 20;
}

for(var p = 0;p<pages.length;++p) {
    collectAssets(p);
}

function collectAssets(pageIndex) {
    var whiteSpaces = [];
    var items = pages[pageIndex].pageItems.everyItem().getElements(); //how to get all items including nested ones... i know a pain

    //find the white spaces!
    for (var i = 0;i<items.length;++i){
        var item = items[i];
        //sometimes these white spaces are text areas... include them
        try{
            if((item == "[object Rectangle]" || item == "[object TextFrame]") && item.fillColor.name == "Paper" && !item.locked){
                whiteSpaces.push(item);
            }
        }
        catch(error){
            //object is invalid
        }
    }

    //find the products!
    for (var i = 0;i<whiteSpaces.length;++i){
        var whiteSpace = whiteSpaces[i];
        var itemsToGroup = new Array;

        for (var p = 0;p<items.length;++p){
            var element = items[p];
            if(isColliding(element,whiteSpace)
            && !element.itemLayer.name.match('specs')
            && !element.locked
            && element.itemLayer.visible
            && (element.geometricBounds[3]-element.geometricBounds[1]) < ((doc.pages[0].bounds[3] - doc.pages[0].bounds[1]/2))/*exclude rectangles larger than product block*/
            && element.itemLayer == whiteSpace.itemLayer){
                itemsToGroup.push(element);
            }
        }

        try {
            if(itemsToGroup.length > 1) {
                var group = pages[pageIndex].groups.add(itemsToGroup);
            }
        }
        catch(e) {
            // alert(e.message + '\n' + 'line ' + e.line);
            // alert(itemsToGroup); break;
        }
    }
}

function isColliding(child, parent) {
    //y1 x1 y2 x2
    var childBounds = child.visibleBounds;
    var parentBounds = parent.visibleBounds;

    var parentHeight = parentBounds[2] - parentBounds[0];
    var parentWidth = parentBounds[3] - parentBounds[1];

    if(childBounds[0] > parentBounds[0] - tolerance
    && childBounds[1] > parentBounds[1] - tolerance
    && childBounds[2] < parentBounds[2] + tolerance
    && childBounds[3] < parentBounds[3] + tolerance ){
        return true;
    }
    else {
        return false;
    }
}