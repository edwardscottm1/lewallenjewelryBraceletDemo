"use strict";
// 11 hours so far
/* Set #choicetable div to be sortable with no cloning or accept new items*/
const beadChoiceSortable = new Sortable(document.querySelector("#choicetable"), {
    animation: 200,
    forceFallback: true,
    direction: "horizontal",
    sort: false,
    scroll: false,
    group: {
        pull: "clone",
        name: "shared",
        put: false,
    }
});
/* Set #sortable div to be sortable*/
new Sortable(document.querySelector("#sortable"), {
    animation: 200,
    forceFallback: true, fallbackOnBody: true,
    direction: "horizontal",
    scroll: false,
    // Function called when element is added by dragging
    onAdd: function (evnt) {
        resizeBeadForBracelet(evnt.item, false);
        // //console.log(checkForSpaceOnBracelet(evnt));
        if (checkForSpaceOnBracelet(evnt)) {
            createErrMsg("Not enough space for that bead.");
            evnt.item.remove();
            updateTotal();
            return;
        }
        addXButton(evnt);
        updateTotal();
        let spanTag = evnt.item.querySelector("span")
        spanTag.remove()
        // evnt.target.removeChild(evnt.item);
    },
    group: {
        name: "shared",
    }
});

// Sortable adds the fallback and ghost at different points in its drag lifecycle.
// Watch for those nodes/classes so both get resized after they exist.
const beadDragResizeObserver = new MutationObserver(function (mutations) {
    const dragVisuals = new Set();
    for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
            if (mutation.target.matches(".sortable-fallback, #sortable .sortable-ghost")) {
                dragVisuals.add(mutation.target);
            }
        }
        for (const node of mutation.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (node.matches(".sortable-fallback, #sortable .sortable-ghost")) {
                dragVisuals.add(node);
            }
            node.querySelectorAll(".sortable-fallback, #sortable .sortable-ghost").forEach(function (visual) {
                dragVisuals.add(visual);
            });
        }
    }

    for (const bead of dragVisuals) {
        resizeDragVisual(bead, bead.classList.contains("sortable-fallback"));
    }
});
beadDragResizeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
    childList: true,
    subtree: true,
});

// Function used to add x button on bead when added to bracelet
function addXButton(evnt) {
    // console.trace("Added x");
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
    // Beads added to cart
    let cart = '';
    // Set the initial total
    let total = 160.00;
    let counter = 0;
    for (let bead of beads) {
        // let beadParts = bead.value.split("+!");
        let beadParts = bead.children[1].value.split("+!");
        // //console.log(beadParts);
        let slength = beads.length;
        // //console.log(slength);
        // let str = ;
        // str = str.slice(str.indexOf("!") + 1);
        // total += Number.parseFloat(str);
        if (parseFloat(beadParts[1]) <= 25 && counter < 3) {
            counter++;
            cart += `${beadParts[0]}\n`;
        } else if (parseFloat(beadParts[1]) <= 42 && slength < 2) {
            counter++;
            cart += `${beadParts[0]}\n`;
        } else {
            total += parseFloat(beadParts[1]);
            cart += beadParts.join("+!");
        }
        // //console.log(counter);

    }
    // Update appropriate elements
    document.querySelector("input#byob_prop4").value = cart;
    // //console.log(document.querySelector("input#byob_prop4").value);
    document.querySelector("#showpricebottom").textContent = total.toFixed(2);
    document.querySelector("#showpricetop").textContent = total.toFixed(2);

}
// Add tap functionality
document.querySelector("#choicetable").addEventListener("click", function (evnt) {
    // SInce we apply lsitner to the div, we need to get the bead closets to the users cursor
    const bead = evnt.target.closest(".bead-state-highlight");
    // ensure we dont try code if user did not click a bead
    if (!bead) return;

    // Clone bead at give styles needed to start transition
    const newBead = bead.cloneNode(true);
    newBead.removeChild(newBead.querySelector("span"));
    // //console.log(newBead);
    newBead.style.position = "absolute";
    newBead.style.listStyleType = "none";
    newBead.style.transition = "transform .5s ease-out";
    // newBead.style.transition = "width 1s ease-out";
    // newBead.style.transition = "height 1s ease-out";
    newBead.style.opacity = ".5";
    // Ensure it goes above sortable div
    newBead.style.zIndex = "9999";



    // Get tapped bead position data
    const originalBeadRectData = bead.getClientRects()[0];
    let originalBeadLeft = originalBeadRectData.left + window.scrollX;  // We need to add the scroll value to get
    let originalBeadTop = originalBeadRectData.top + window.scrollY;    // the absolute top/left values
    // Now get position for spot on bracelet
    const sortableDiv = document.querySelector("#sortable");
    const braceletContainerRectData = sortableDiv.getClientRects()[0];
    let braceletTop = braceletContainerRectData.top + window.scrollY;
    // Constants that need to be added to ensure proper spacing
    const BEAD_PADDING = 6;
    // //console.log(sortableDiv);
    const BRACELET_CONTAINER_PADDING = document.querySelector("#collector").getBoundingClientRect().width * 0.0258064516;
    // TO get the new beads left value, we first need to know if the sortable div has neads in it
    let nextBeadPosLeft = 0;
    if (sortableDiv.children.length > 0) {
        // If there is a bead, get the right value of last bead and add constants
        nextBeadPosLeft = sortableDiv.lastElementChild.getClientRects()[0].right + BEAD_PADDING + window.scrollX;
    } else {
        // If no beads present, get the sortable div left value and add constants
        nextBeadPosLeft = sortableDiv.getClientRects()[0].left + BRACELET_CONTAINER_PADDING + window.scrollX;// 

    }
    //console.log(nextBeadPosLeft);

    // Transform values, used for animation
    let deltaTop = braceletTop - originalBeadTop;
    let deltaLeft = nextBeadPosLeft - originalBeadLeft;
    // console.log(`Top: ${deltaTop} Left: ${deltaLeft}`);
    // console.log(originalBeadLeft + deltaLeft);
    // Put bead at the tapped bead
    newBead.style.top = `${originalBeadTop}px`;
    newBead.style.left = `${originalBeadLeft}px`;

    // Append to the body
    document.body.appendChild(newBead);
    newBead.offsetWidth;
    const newBeadPercentageSizing = resizeBeadForBracelet(newBead, true);
    // Needed for firefox to properly render animation
    newBead.offsetWidth;

    // Resize bead 
    // Add animation frame to show bead moving
    requestAnimationFrame(() => {
        // Use translate to move the bead
        newBead.style.transform = `translate(${deltaLeft}px, ${deltaTop}px)`;
    });
    // Once bead has transitioned, reset styles, add x button, update total
    newBead.addEventListener("transitionend", function (evnt) {
        // Add bead to correct container
        let newBead = evnt.target;
        newBead.style.position = "";
        newBead.style.transform = "";
        newBead.style.top = "";
        newBead.style.left = "";
        newBead.style.transition = "";
        newBead.style.opacity = "1";
        newBead.style.setProperty("width", `${newBeadPercentageSizing[0] * 100}%`, "important");
        newBead.style.setProperty("height", `${newBeadPercentageSizing[1] * 100}%`, "important");
        const beadImage = newBead.querySelector("img");
        beadImage.style.setProperty("width", "100%", "important");
        beadImage.style.setProperty("height", "100%", "important");
        document.querySelector("#sortable").appendChild(newBead);
        // newBead.offsetWidth;
        addXButton(newBead);


        if (checkForSpaceOnBracelet(newBead)) {
            createErrMsg("Not enough space for that bead.");
            newBead.remove();
        } else {
            updateTotal();
        }
    }, { once: true });
});
function checkForSpaceOnBracelet(evnt) {
    const bracelet = document.querySelector("#sortable");
    // //console.log(bracelet.getBoundingClientRect());
    const braceletWidth = bracelet.getBoundingClientRect().width - (bracelet.getBoundingClientRect().width * .02971768202);
    // console.log(`Breaclet width: ${braceletWidth}`);
    const BEAD_MARGIN = 6;
    const beads = document.querySelectorAll("#sortable .bead-state-highlight");

    let currentOccupiedSpace = 0;
    for (let bead of beads) {
        // //console.log(bead.getClientRects());
        currentOccupiedSpace += bead.getClientRects()[0].width + BEAD_MARGIN;
    }
    // console.log(`Occupied space ${currentOccupiedSpace}`);
    let addedBead = '';
    // IF the user dragged in the item
    // WHen you drag an item in, the ghost is part of the div so we don't need to add the new beads width
    if (typeof evnt.item !== "undefined") {
        addedBead = evnt.item;

        return currentOccupiedSpace > braceletWidth ? true : false;

    } else {
        // If user clicked the item, we have to add the beads with as its not part of the div yet
        addedBead = evnt;
        const addedBeadWidth = addedBead.getClientRects()[0].width;
        // console.log(addedBead.getBoundingClientRect());
        return currentOccupiedSpace + addedBeadWidth > braceletWidth ? true : false;
    }
    // //console.log(currentOccupiedSpace, addedBeadWidth, braceletWidth);
}
function createErrMsg(msg) {
    // First check if an error msg is already shown
    if (document.querySelector(".errorDiv")) {
        return;
    }

    // Create a div holding an error message
    let errorDiv = document.createElement("div");
    errorDiv.classList.add("errorDiv");
    errorDiv.textContent = msg;

    // Remove the div once it transitioned
    errorDiv.addEventListener("transitionend", function (evnt) {
        if (evnt.type == "transitionend") {
            evnt.target.remove();
        }
    });
    document.body.append(errorDiv);
    errorDiv.offsetWidth;

    // Start animation to make opacity go to 0
    requestAnimationFrame(() => {
        errorDiv.style.opacity = "0";
    });
}



// const beads = document.querySelectorAll(".bead-state-highlight");

// for (let bead of beads) {
//     bead.style.aspectRatio = bead.clientWidth / bead.clientHeight;
//     //console.log(bead);
// }


function resizeBeadForBracelet(newBead, returnPercentage) {
    const beadImage = newBead.querySelector("img");
    const sourceHeight = Number(beadImage.getAttribute("height")) || beadImage.naturalHeight || beadImage.height;
    const sourceWidth = Number(beadImage.getAttribute("width")) || beadImage.naturalWidth || beadImage.width;
    const newBeadHeightPercentage = sourceHeight / 52;
    const newBeadWidthPercentage = sourceWidth / 613;

    const sortableRect = document.querySelector("#sortable").getBoundingClientRect();
    const newBeadTransitionHeight = sortableRect.height * newBeadHeightPercentage;
    const newBeadTransitionWidth = sortableRect.width * newBeadWidthPercentage;
    if (returnPercentage) {
        newBead.style.setProperty("height", `${newBeadTransitionHeight}px`, "important");
        newBead.style.setProperty("width", `${newBeadTransitionWidth}px`, "important");
        beadImage.style.setProperty("height", `${newBeadTransitionHeight}px`, "important");
        beadImage.style.setProperty("width", `${newBeadTransitionWidth}px`, "important");
        return [newBeadWidthPercentage, newBeadHeightPercentage];
    } else {
        newBead.style.setProperty("height", `${newBeadHeightPercentage * 100}%`, "important");
        newBead.style.setProperty("width", `${newBeadWidthPercentage * 100}%`, "important");
        beadImage.style.setProperty("height", "100%", "important");
        beadImage.style.setProperty("width", "100%", "important");
    }
}

function resizeDragVisual(bead, usePixelDimensions) {
    if (!bead) return;
    const sizingMode = usePixelDimensions ? "pixels" : "percent";
    if (bead.dataset.braceletSizingMode === sizingMode) return;

    resizeBeadForBracelet(bead, usePixelDimensions);
    bead.dataset.braceletSizingMode = sizingMode;

    if (usePixelDimensions) {
        const fallbackRect = bead.getBoundingClientRect();
        beadChoiceSortable.option("fallbackOffset", {
            x: fallbackRect.width / 2,
            y: fallbackRect.height / 2,
        });
    }
}



//  horus so far
// 4 - 10/9
// 2 - 10/20
// 4 - 10/21