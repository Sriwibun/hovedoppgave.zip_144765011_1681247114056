"use strict"
import { TPoint, } from "./GLIB_2D.js";
import {
    initMenu, createMenu, EButtonState, EColorType, EStrokeSizeType, EShapeType, EActionType,
    paintObjectList, menuAddPaintShape, menuMovePaintShapeDown, menuMovePaintShapeUp
} from "./menu.js";



let cvs = null;
let ctx = null;

let lastX = 0;
let lastY = 0;

let drawingProperties = new TDrawingProperties();
let currentDrawingObject = null;

const mousePos = new TPoint(0, 0);
const drawingList = [];


const NewLine = "<br />";
const txtLog = document.getElementById("txtLog");


//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------

function TDrawingProperties(aShapeType, aFillStyle, aStrokeStyle, aLineWidth) {

    this.shapeType = aShapeType;
    this.fillStyle = aFillStyle;
    this.strokeStyle = aStrokeStyle;
    this.lineWidth = aLineWidth;

    this.goodToGo = function () {
        return (this.shapeType && this.fillStyle && this.strokeStyle && this.lineWidth);
    };
}

function TDrawingObject(aStartPos, aDrawingProp) {
    const points = [aStartPos];
    const prop = new TDrawingProperties(aDrawingProp.shapeType, aDrawingProp.fillStyle, aDrawingProp.strokeStyle, aDrawingProp.lineWidth);

    this.dragPos = null;
    this.name = "";

    this.addPos = function (aPoint) {
        points.push(aPoint);
    };

    this.draw = function () {
        ctx.fillStyle = prop.fillStyle;
        ctx.strokeStyle = prop.strokeStyle;
        ctx.lineWidth = prop.lineWidth;
        const posStart = points[0];
        let posEnd = points[points.length - 1];
        let radius;

        switch (prop.shapeType) {
            case EShapeType.Line: // Line
            case EShapeType.Pen: // Pen
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                if (this.dragPos) {
                    ctx.lineTo(this.dragPos.x, this.dragPos.y);
                }
                ctx.stroke();
                break;

            case EShapeType.Circle: // Circle
            case EShapeType.Oval: // Oval
                if (this.dragPos) {
                    posEnd = this.dragPos;
                }

                ctx.beginPath();
                if (prop.shapeType === EShapeType.Circle) {
                    radius = Math.sqrt(Math.pow(posEnd.x - posStart.x, 2) + Math.pow(posEnd.y - posStart.y, 2));
                    ctx.arc(posStart.x, posStart.y, radius, 0, Math.PI * 2);
                } else {
                    radius = [Math.abs(posEnd.x - posStart.x), Math.abs(posEnd.y - posStart.y)];
                    ctx.ellipse(posStart.x, posStart.y, radius[0], radius[1], 0, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.stroke();
                break;

            case EShapeType.Rectangle: // Rectangle  
                if (this.dragPos) {
                    posEnd = this.dragPos;
                }
                radius = [posEnd.x - posStart.x, posEnd.y - posStart.y];
                ctx.fillRect(posStart.x, posStart.y, radius[0], radius[1]);
                ctx.strokeRect(posStart.x, posStart.y, radius[0], radius[1]);
                break;

            case EShapeType.Polygon: // Polygon (Missing)
                break;


        }
    };
};

//------------------------------------------------------------------------------------------------------------------
//------ Function and Events
//------------------------------------------------------------------------------------------------------------------

function addLogText(aText) {
    if (txtLog.innerHTML.length > 0) {
        txtLog.innerHTML += NewLine;
    }
    txtLog.innerHTML += aText;
}

function newDrawing() {

    const paintObjects = paintObjectList.children;
    currentDrawingObject = null;
    drawingList.length = 0;
    addLogText("New Drawing!");

    for (let i = 0; i < paintObjects.length;) {
        let listDelete = paintObjectList.children[i];
        listDelete.remove();
    }

    updateDrawing();
}

function removeDrawingObject() {
    addLogText("Delete shape!");
    const paintObjects = paintObjectList.children;
    let selectedName = "";
    let divDelete = null;
    let deleteIndex = -1;

    for (let i = 0; i < paintObjects.length; i++) {
        if (paintObjects[i].classList.contains("selected") === true) {  // Checkes if layer has value "selected"
            selectedName = paintObjects[i].innerText;
            divDelete = paintObjects[i];
        }
    }
    if (divDelete !== null) {
        divDelete.remove();
    }

    for (let i = 0; i < drawingList.length; i++) {
        if (drawingList[i].name === selectedName) {
            deleteIndex = i;
        }
    }
    if (deleteIndex >= 0) {
        drawingList.splice(deleteIndex, 1);

        updateDrawing();
    }
}

function updateDrawing() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    // Update drawing with all shapes
    for (let i = 0; i < drawingList.length; i++) {
        drawingList[i].draw();
    }
    if (currentDrawingObject) {
        currentDrawingObject.draw();
    }
}


/*
    This function is call from the menu when all menuitems is loaded
*/
function loadPaintApp() {
    createMenu(cmbClick);
    newDrawing();
}

function cmbClick(aContainerKey, aButtonKey, aButtonValue) {
    let txtLog = "Container " + aContainerKey + " => ";
    txtLog += "Button " + aButtonKey + ", value = " + aButtonValue.toLocaleString();
    addLogText(txtLog);

    if (!drawingProperties) {
        drawingProperties = new TDrawingProperties();
    }

    if (aContainerKey === "Action") {
        switch (aButtonKey) {
            case aButtonKey === "New":
                newDrawing();
                break;
            case aButtonKey === "Eraser":
                removeDrawingObject();
                break;
            case aButtonKey === "MoveUp":
                menuMovePaintShapeUp();
                break;
            case aButtonKey === "MoveDown":
                menuMovePaintShapeDown();
                break;
        }
    } else if
        (aContainerKey === "StrokeColor") {
        drawingProperties.strokeStyle = aButtonValue;
    } else if (aContainerKey === "FillColor") {
        drawingProperties.fillStyle = aButtonValue;
    } else if (aContainerKey === "StrokeSize") {
        drawingProperties.lineWidth = aButtonValue;
    } else if (aContainerKey === "ShapeType") {
        drawingProperties.shapeType = aButtonValue;
    }

    console.log(drawingProperties);

}


/*if ((aContainerKey === "Action") && (aButtonKey === "New")) {
    newDrawing();
}

if ((aContainerKey === "Action") && (aButtonKey === "Eraser")) {
    drawingList.pop();
}*/


function setMousePos(aEvent) {
    const bounds = cvs.getBoundingClientRect();
    mousePos.x = aEvent.clientX - bounds.left;
    mousePos.y = aEvent.clientY - bounds.top;
}

export function cvsPaintMouseMove(aEvent) {      // denne kjører setMousePos når cvsPaintMouseMove blir ropt på
    // Mouse move over canvas
    setMousePos(aEvent);

    if (currentDrawingObject) {
        if (drawingProperties.shapeType === EShapeType.Pen) {
            currentDrawingObject.addPos(new TPoint(mousePos.x, mousePos.y));
        }

        updateDrawing();
    }
}

export function cvsPaintMouseDown() { // denne må kjøre igang hele tegnefunksjonen
    // Mouse button down in canvas

    lastX = mousePos.x;
    lastY = mousePos.y

    if (drawingProperties.goodToGo()) {
        if (!currentDrawingObject) {
            currentDrawingObject = new TDrawingObject(new TPoint(lastX, lastY), drawingProperties);
            currentDrawingObject.dragPos = mousePos;
        }
    }
}


export function cvsPaintMouseUp(aEvent) {  // denne stopper tegningen
    // Mouse button up in canvas

    if (drawingProperties.goodToGo()) {
        if (currentDrawingObject) {
            currentDrawingObject.addPos(new TPoint(mousePos.x, mousePos.y));
            drawingList.push(currentDrawingObject);

            // Adds the new object/shape made to the list
            currentDrawingObject.dragPos = null;
            currentDrawingObject.name = "shape " + drawingList.length;
            menuAddPaintShape(currentDrawingObject.name);
            currentDrawingObject = null;
            updateDrawing();
        }
    }

    console.log("Tegneliste: " + drawingList.length.toString());
}

export function initPaint(aPaintCanvas, aMenuCanvas) {
    cvs = aPaintCanvas;
    ctx = cvs.getContext("2d");
    cvs.addEventListener("mousemove", cvsPaintMouseMove);
    cvs.addEventListener("mousedown", cvsPaintMouseDown);
    cvs.addEventListener("mouseup", cvsPaintMouseUp);

    /* 
        Initialize the menu with canvas for drawing menu items.
        loadPaintApp is the call back when all menuitems has been created
    */
    initMenu(aMenuCanvas, loadPaintApp);
}