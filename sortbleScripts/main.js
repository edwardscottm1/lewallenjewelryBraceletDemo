"use strict";

/* Set #choicetable div to be sortable with no cloning or accept new items*/
new Sortable(document.querySelector("#choicetable"), {
    animation: 200,
    direction: "horizontal",
    sort: false,
    group: {
        pull: "clone",
        name: "shared",
        put: "false",
    }

});

/* Set #sortable div to be sortable*/
new Sortable(document.querySelector("#sortable"), {
    animation: 200,
    direction: "horizontal",
    // Function called when element is added by dragging
    onAdd: function (evnt) {
        console.log(checkForSpaceOnBracelet(evnt));
        if (checkForSpaceOnBracelet(evnt)) {
            createErrMsg("Not enough space for that bead!!!!!!!!!!!!!!!!");
            console.log("Not enough space for that bead!!!!!!!!!!!!!!!!")


            evnt.item.remove();
            updateTotal();
            return;
        }
        addXButton(evnt);
        updateTotal();
        // }
    },
    group: {
        name: "shared",
    }
});

// Function used to add x button on bead when added to bracelet
function addXButton(evnt) {
    let bead = '';
    // IF the user dragged in the item
    if (typeof evnt.item !== "undefined") {
        bead = evnt.item;
    } else {
        // If user clicked the item
        bead = evnt;
    }
    // Create 'x' button
    let removeButton = document.createElement("button");
    removeButton.textContent = 'x';
    removeButton.classList.add("removeBeadButton");
    removeButton.addEventListener("click", function (evnt) {
        evnt.stopPropagation();
        evnt.target.parentElement.remove();
        // Update total cost
        updateTotal();
    });
    bead.prepend(removeButton);
}
// Function used to calculate total cost of bracelet
function updateTotal() {
    // Get beads that are in the destination div
    const beads = document.querySelector("#sortable").children;

    // Set the initial total
    let total = 160.00;
    for (let bead of beads) {
        let str = bead.children[1].value;
        str = str.slice(str.indexOf("!") + 1);
        total += Number.parseFloat(str);
    }
    // Update appropriate elements
    document.querySelector("#showpricebottom").textContent = total.toFixed(2);
    document.querySelector("#showpricetop").textContent = total.toFixed(2);
}


document.querySelector("#choicetable").addEventListener("click", function (evnt) {

    const bead = evnt.target.closest(".bead-state-highlight");

    // ensure we dont try code if user did not click a bead
    if (!bead) return;

    // your animation code
    if (checkForSpaceOnBracelet(bead)) {
        createErrMsg("Not enough space for that bead!!!!!!!!!!!!!!!!");
        console.log("Not enough space for that bead!!!!!!!!!!!!!!!!")
        return;
    }
    // Clone bead at give styles needed to start transition
    let newBead = bead.cloneNode(true);
    newBead.style.position = "absolute";
    newBead.style.listStyleType = "none";
    newBead.style.transition = "all .5s ease-out";
    newBead.style.opacity = .5;
    // Ensure it goes above sortable div
    newBead.style.zIndex = "9999";
    
    
    // Get tapped bead position data
    const originalBeadRectData = bead.getClientRects()[0]; 
    let originalBeadLeft = originalBeadRectData.left + window.scrollX;  // We need to add the scroll value to get
    let originalBeadTop = originalBeadRectData.top + window.scrollY;    // the absolute top/left values
    
    
    // Now get position for spot on bracelet
    const sortableDiv = document.querySelector("#sortable");
    const braceletContainerRectData = sortableDiv.getClientRects()[0]
    let braceletTop = braceletContainerRectData.top + window.scrollY;
    
    // Constants that need to be added to ensure proper spacing
    const BEAD_PADDING = 6
    const BRACELET_CONTAINER_PADDING = 7;
    
    // TO get the new beads left value, we first need to know if the sortable div has neads in it
    let nextBeadPosLeft = 0;
    if (sortableDiv.children.length > 0) {
        console.log("more than one")
        // If there is a bead, get the right value of last bead and add constants
        nextBeadPosLeft = sortableDiv.lastElementChild.getClientRects()[0].right + BEAD_PADDING + window.scrollX;
        
    } else {
        // If no beads present, get the sortable div left value and add constants
        nextBeadPosLeft = sortableDiv.getClientRects()[0].left + BRACELET_CONTAINER_PADDING + BEAD_PADDING + window.scrollX;// 
    }
    
    
    // Transform values, used for animation
    let deltaTop =  braceletTop - originalBeadTop;
    let deltaLeft =  nextBeadPosLeft - originalBeadLeft;
    
    // Put bead at the tapped bead
    newBead.style.top = `${originalBeadTop}px`;
    newBead.style.left = `${originalBeadLeft}px`;
    
    // Append to the body
    document.body.appendChild(newBead);
    
    // Add animation frame to show bead moving
    requestAnimationFrame(() => {
        // Use translate to move the bead
        newBead.style.transform = `translate(${deltaLeft}px, ${deltaTop}px)`;
    });
    
    // Once bead has transitioned, reset styles, add x button, update total
    newBead.addEventListener("transitionend", function (evnt) {
        // Add bead to correct container
        let newBead = evnt.target;
        document.querySelector("#sortable").appendChild(newBead);
    
        newBead.style.position = "";
        newBead.style.transform = "";
        newBead.style.top = "";
        newBead.style.left = "";
        newBead.style.transition = "";
        newBead.style.opacity = 1;
        addXButton(newBead);
        updateTotal();
    
    })
});




function checkForSpaceOnBracelet(evnt) {
    const bracelet = document.querySelector("#sortable");
    const braceletWidth = bracelet.getClientRects()[0].width -20;
    const BEAD_MARGIN = 6;
    const beads = document.querySelectorAll("#sortable .bead-state-highlight");
    let currentOccupiedSpace = 0;

    for (let bead of beads) {
        // console.log(bead.getClientRects());
        currentOccupiedSpace += bead.getClientRects()[0].width + BEAD_MARGIN;
    }

    let addedBead = '';
    // IF the user dragged in the item
    if (typeof evnt.item !== "undefined") {
        addedBead = evnt.item;
    } else {
        // If user clicked the item
        addedBead = evnt;
    }

    const addedBeadWidth = addedBead.getClientRects()[0].width + BEAD_MARGIN;

    return currentOccupiedSpace + addedBeadWidth > braceletWidth ? true : false;

    // console.log(currentOccupiedSpace);
}


function createErrMsg(msg) {
    let errorDiv = document.createElement("div");
    errorDiv.classList.add("errorDiv");
    errorDiv.textContent = msg;

    // // Create 'x' button
    // let removeButton = document.createElement("button");
    // removeButton.textContent = 'x';
    // removeButton.classList.add("removeBeadButton");
    // removeButton.addEventListener("click", function (evnt) {
    //     evnt.stopPropagation();
    //     evnt.target.parentElement.remove();
    //     // Update total cost
    // });
    // errorDiv.prepend(removeButton);
    requestAnimationFrame(() => {
        errorDiv.style.opacity = "0";
    })

    errorDiv.addEventListener("transitionend", function (evnt) {
        evnt.target.remove();
    });

    document.body.append(errorDiv);


}