// function editPathD(ptObj, action=null) {
//     // ptObj =  {pts:[{x:..,y:.., type:'r'}]}   r is for relative coordinates, a is for absolute coordinates
//     if(action=="move") {
//         // arrow at top:  `M 0 0 L 7 0 L 8 -1 L 9 0 L 12 0 L 12 4 L 0 4 L 0 0`
//         // arrow at left :`M 0 0 L 12 0 L 12 4 L 0 4 L 0 3 L -1 2 L 0 1 L 0 0`
//         // arrow at right :`M 0 0 L 12 0 L 12 1 L 13 2 L 12 3 L 12 4 L 0 4 L 0 0`
//         // arrow at bottom :`M 0 0 L 12 0 L 12 4 L 10 4 L 9 5 L 8 4 L 0 4 L 0 0`
//     }
// }

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
module.exports = {
    MapInfoItem: MapInfoItem
}
