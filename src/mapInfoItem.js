// PURPOSE:
// this corresponds to a marker appearing on the map with data associated with it.

class MapInfoItem {

    constructor(id, x, y, displayStatus, labelText) {
        this.id = id
        this.x = x
        this.y = y
        this.displayStatus = displayStatus;
        this.labelText = labelText;
        /*
        nodeOnly:   just the circle at x,y is showing
        nodeAndLabel:   the circle at x,y and a mini label (usually for name) is showing
        all:        the circle, and an expanded window is showing.
        */

    }
}


// function editPathD(ptObj, action=null) {
//     // ptObj =  {pts:[{x:..,y:.., type:'r'}]}   r is for relative coordinates, a is for absolute coordinates
//     if(action=="move") {
//         // arrow at top:  `M 0 0 L 7 0 L 8 -1 L 9 0 L 12 0 L 12 4 L 0 4 L 0 0`
//         // arrow at left :`M 0 0 L 12 0 L 12 4 L 0 4 L 0 3 L -1 2 L 0 1 L 0 0`
//         // arrow at right :`M 0 0 L 12 0 L 12 1 L 13 2 L 12 3 L 12 4 L 0 4 L 0 0`
//         // arrow at bottom :`M 0 0 L 12 0 L 12 4 L 10 4 L 9 5 L 8 4 L 0 4 L 0 0`
//     }
// }


function createRegionInfoItem(regionInfo)  {
    var {itemId, continentId,regionA3,regionAdmin, bBox} = regionInfo
    var center = {x: bBox.x + bBox.width/2 , y: bBox.y + bBox.height/2}
    console.log(bBox)
    var infoItem = new MapInfoItem(itemId,center.x,center.y,"nodeOnly",regionAdmin);
    var new_g = document.createElementNS("http://www.w3.org/2000/svg","g");

    new_g.setAttributeNS(null, "id",infoItem.id+"Unit");
    new_g.setAttributeNS(null, "class","regionInfoItem");


    var new_circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    new_circle.setAttributeNS(null, "id",infoItem.id+"Node");
    new_circle.setAttributeNS(null, "cx", infoItem.x);
    new_circle.setAttributeNS(null, "cy", infoItem.y);
    new_circle.setAttributeNS(null, "r",.25);
    new_circle.setAttributeNS(null, "fill","transparent");
    new_circle.setAttributeNS(null, "stroke","black");
    new_circle.setAttributeNS(null, "strokeWidth","1");

    var new_path = document.createElementNS("http://www.w3.org/2000/svg","circle");
    new_path.setAttributeNS(null, "id",infoItem.id+"Label");
    new_path.setAttributeNS(null, "d", `M ${infoItem.x} ${infoItem.y} l 1 -1 l 5 0 l 0 -4 l -12 0 l 0 4 l 5 0 l 1 1`);
    new_path.setAttributeNS(null, "fill", 'grey');

    var new_text = document.createElementNS("http://www.w3.org/2000/svg","text");
    new_text.setAttributeNS(null, "x",infoItem.x-10);
    new_text.setAttributeNS(null, "y", infoItem.y-2);
    new_text.setAttributeNS(null, "fontFamily", 'Verdana');
    new_text.setAttributeNS(null, "fontSize", 'smaller');
    new_text.setAttributeNS(null,"fill","black");
    new_text.innerHTML = infoItem.labelText
    
    new_g.appendChild(new_circle);
    new_g.appendChild(new_path);
    new_g.appendChild(new_text);


    document.getElementById(continentId+"InfoItems").appendChild(new_g)

    return infoItem
}

function createSubInfoItem(regionInfo) {
    
}
module.exports = {
    MapInfoItem: MapInfoItem,
    createSubInfoItem:createSubInfoItem,
    createRegionInfoItem:createRegionInfoItem
}


