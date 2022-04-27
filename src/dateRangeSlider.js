

import React from 'react';
import noUiSlider from 'nouislider';
var startDateDefault = new Date("2004-01-01").getTime()
var dateSliderOptions = {
    start:[startDateDefault,Date.now()],
    connect:true,
    step: 1, 
    behaviour:'tap-drag',
    range:{'min':startDateDefault, 'max':Date.now()},
    direction:'ltr',
   
    pips: {
        mode:'range', density:3, 
        format: {to :  function(val) {return new Date(val).toDateString()}}
    }
}


export const DateRangeSlider = () =>{
    
    var D = document.createElement("div");
    noUiSlider.create(D, dateSliderOptions).on('update', function (values, handle) {
        var startDateObj = new Date(parseInt(values[0]));
        var endDateObj = new Date(parseInt(values[1]));
        if(document.getElementById("startDateElement")) document.getElementById("startDateElement").value =  startDateObj.toISOString().substr(0,10)
        if(document.getElementById("endDateElement")) document.getElementById("endDateElement").value = endDateObj.toISOString().substr(0,10)
    })
    // D.noUiSlider.on('update', function (values, handle) {
    //     var startDateObj = new Date(parseInt(values[0]));
    //     var endDateObj = new Date(parseInt(values[1]));
    //     if(document.getElementById("startDateElement")) document.getElementById("startDateElement").value =  startDateObj.toISOString().substr(0,10)
    //     if(document.getElementById("endDateElement")) document.getElementById("endDateElement").value = endDateObj.toISOString().substr(0,10)
    // })
    
    return D.outerHTML;
}

export class asdf {
    constructor(props) {
        // super(props);
        

    }
    componentDidMount() {
        
    }
    // render() {
    //     var startDateObj = new Date("2004-01-01");
    //     var endDateObj = new Date(Date.now())
    
        
    //     var startDateIntStr = toString(startDateObj.getTime());
    //     var endDateIntStr= toString(endDateObj.getTime());
        
    //     // return (
    //     //     <div id="dateSlider" className="noUi-target noUi-ltr noUi-horizontal noUi-txt-dir-ltr">
    //     //         <div className="noUi-base">
    //     //             <div className="noUi-connects">
    //     //                 <div className="noUi-connect noUi-draggable" style={{transform: "translate(0%, 0px) scale(1, 1)"}}>
        
    //     //                 </div>
    //     //             </div>
    //     //             <div className="noUi-origin" style={{transform: "translate(-100%, 0px)", zIndex: 5}}>
    //     //                 <div className="noUi-handle noUi-handle-lower" data-handle="0" tabIndex="0" role="slider" aria-orientation="horizontal" aria-valuemin={startDateIntStr} aria-valuemax={endDateIntStr} aria-valuenow={startDateIntStr} aria-valuetext={startDateIntStr}>
    //     //                     <div className="noUi-touch-area"></div>
                                
    //     //                 </div>
    //     //             </div>
    //     //             <div className="noUi-origin" style={{transform: "translate(0%, 0px)", zIndex: 4}}>
    //     //                 <div className="noUi-handle noUi-handle-upper" data-handle="1" tabIndex="0" role="slider" aria-orientation="horizontal" aria-valuemin={startDateIntStr} aria-valuemax={endDateIntStr} aria-valuenow={endDateIntStr} aria-valuetext={endDateIntStr}>
    //     //                     <div className="noUi-touch-area"></div>
    //     //                 </div>
    //     //             </div>
    //     //         </div>
    //     //         <div className="noUi-pips noUi-pips-horizontal">
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-large" style={{left:"0%"}}></div>
    //     //             <div className="noUi-value noUi-value-horizontal noUi-value-large" data-value={startDateIntStr} style={{left:"0%"}}>{startDateObj.toISOString().substr(0,10)}</div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"3.0303%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"6.06061%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"9.09091%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"12.1212%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"15.1515%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"18.1818%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"21.2121%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"24.2424%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"27.2727%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"30.303%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"33.3333%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"36.3636%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"39.3939%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"42.4242%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"45.4545%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"48.4849%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"51.5151%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"54.5455%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"57.5758%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"60.6061%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"63.6364%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"66.6667%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"69.697%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"72.7273%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"75.7576%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"78.7879%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"81.8182%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"84.8485%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"87.8788%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"90.9091%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"93.9394%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-normal" style={{left:"96.9697%"}}></div>
    //     //             <div className="noUi-marker noUi-marker-horizontal noUi-marker-large" style={{left:"100%"}}></div>
    //     //             <div className="noUi-value noUi-value-horizontal noUi-value-large" data-value={endDateIntStr} style={{left:"100%"}}>{endDateObj.toISOString().substr(0,10)}</div>
    //     //         </div>
    //     //     </div>
    //     // )
    // }
}
