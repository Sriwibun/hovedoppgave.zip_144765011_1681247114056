"use strict"
import { TPoint, } from "./GLIB_2D.js";
import {
    initMenu, createMenu, EButtonState, EColorType, EStrokeSizeType, EShapeType, EActionType,
    paintObjectList, paintObjectClick, menuAddPaintShape, menuMovePaintShapeDown, menuMovePaintShapeUp, menuGetCurrentPaintShape, menuRemovePaintShape
} from "./menu.js";


let cvs = null;
let ctx = null;
let posX = 0;
let posY = 0;


let drawingProperties = new TDrawingProperties();
let currentDrawingObject = null;

const mousePos = new TPoint(0, 0);
const drawings = [];


const NewLine = "<br />";
const txtLog = document.getElementById("txtLog");


//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------

//Start Class TDrawingProperties

export function TDrawingProperties(aShapeType, aFillStyle, aStrokeStyle, aLineWidth) { //This class Gathers the information from the active buttons
    this.shapeType = aShapeType;
    this.fillStyle = aFillStyle;
    this.strokeStyle = aStrokeStyle;
    this.lineWidth = aLineWidth;

    this.goodToGo = function () {
        return (this.shapeType && this.fillStyle && this.strokeStyle && this.lineWidth);
    }
} //End Class TDrawingProperties


//Start Class TDRawingObject
export function TDrawingObject(aStartPos, aDrawingProp) {//this class is used to draw the different shapes based on the info sent from TDrawingProperties
    const points = [new TPoint(aStartPos.x, aStartPos.y)];
    const prop = new TDrawingProperties(aDrawingProp.shapeType, aDrawingProp.fillStyle, aDrawingProp.strokeStyle, aDrawingProp.lineWidth);
    let rubberBandPos = aStartPos;


    this.name = Object.keys(EShapeType)[prop.shapeType - 1] + "-" + (drawings.length + 1).toString(); // Sets name for the drawing object 

    this.addPos = function (aPoint) { //Need this to add extra points to Pen and polygon
        points.push(aPoint);
    };

    this.draw = function () {
        ctx.fillStyle = prop.fillStyle;
        ctx.strokeStyle = prop.strokeStyle;
        ctx.lineWidth = prop.lineWidth;

        let endPos = rubberBandPos;
        if (endPos === null) {
            endPos = points[1];
        }

        switch (prop.shapeType) {
            case EShapeType.Line: // Line
            case EShapeType.Pen: // Pen
            case EShapeType.Polygon: //Polygon
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                if (rubberBandPos) {
                    ctx.lineTo(rubberBandPos.x, rubberBandPos.y);
                }

                if (prop.shapeType === EShapeType.Polygon) { // Need closePath() and fill() only for the polygon (to complete shape and add fill) 
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.stroke();
                break;

            case EShapeType.Circle: // Circle
            case EShapeType.Oval: // Oval

                ctx.beginPath();

                if (prop.shapeType === EShapeType.Circle) {
                    let radius = Math.sqrt(Math.pow(points[0].x - endPos.x, 2) + Math.pow(points[0].y - endPos.y, 2));
                    ctx.arc(points[0].x, points[0].y, radius, 0, 2 * Math.PI);
                } else {
                    let radius = [Math.abs(endPos.x - points[0].x), Math.abs(endPos.y - points[0].y)];
                    ctx.ellipse(points[0].x, points[0].y, radius[0], radius[1], 0, 0, Math.PI * 2);
                }

                ctx.fill();
                ctx.stroke();
                break;

            case EShapeType.Rectangle: // Rectangle  
                let size = { width: endPos.x - points[0].x, height: endPos.y - points[0].y };
                ctx.fillRect(points[0].x, points[0].y, size.width, size.height);
                ctx.strokeRect(points[0].x, points[0].y, size.width, size.height);
                break;
        }
    };
    this.setEnd = function (aPos) {//Used to set final endposition of drawing object
        points.push(new TPoint(aPos.x, aPos.y));
        rubberBandPos = null;
    }
} // End Class TDrawingObject


//------------------------------------------------------------------------------------------------------------------
//------ Function and Events
//------------------------------------------------------------------------------------------------------------------

function addLogText(aText) {
    if (txtLog.innerHTML.length > 0) {
        txtLog.innerHTML += NewLine;
    }
    txtLog.innerHTML += aText;
}

function newDrawing() { //Clearing canvas to start over

    addLogText("New Drawing!");

    currentDrawingObject = null;
    drawings.length = 0;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

}

function removeObject() { //Used to remove only "selected" object
    addLogText("Deleted shape!");

    const paintObjects = paintObjectList.children;
    let selectedName = "";
    let divDelete = null;
    for (let i = 0; i < paintObjects.length; i++) {
        if (paintObjects[i].classList.contains("selected") === true) {  // Checkes if layer has value "selected"
            selectedName = paintObjects[i].innerText;
        }
    }
        selectedName.remove();


    let deleteIndex;
    for (let i = 0; i < drawings.length; i++) {
        if (drawings[i].name === selectedName) {
            deleteIndex = i;
        }
    }
    if (deleteIndex >= 0) {
        drawings.splice(deleteIndex, 1);

        updateDrawing();
    }
}

function updateDrawing() {//Need this to make canvas ready for next drawing cycle
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    for (let i = 0; i < drawings.length; i++) {
        drawings[i].draw();
    }

    if (currentDrawingObject) {
        currentDrawingObject.draw();
    }
}


/*
    This function is called from the menu when all menuitems is loaded
*/

function loadPaintApp() {
    createMenu(cmbClick);
    newDrawing();
}

function cmbClick(aContainerKey, aButtonKey, aButtonValue) {
    let txtLog = "Container " + aContainerKey + " => ";
    txtLog += "Button " + aButtonKey + ", value = " + aButtonValue.toLocaleString();
    addLogText(txtLog);

    if (!drawingProperties) { //Making an occurence of TDrawingProperties, but without setting parameters needed
        drawingProperties = new TDrawingProperties();
    }

    if (aContainerKey === "Action") { //Calls the functions that should run when each action-button is clicked
        switch (aButtonValue) {
            case EActionType.New:
                newDrawing();
                break;
            case EActionType.Eraser:
                removeObject();
                break;
            case EActionType.MoveUp:
                menuMovePaintShapeUp();
                break;
            case EActionType.MoveDown:
                menuMovePaintShapeDown();
                break;
        }
    } else if //Set the parameters needed for TDrawingProperties (the color/fill/size/shape chosen by active buttons)
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


function setMousePos(aEvent) {  //Sets the mouseposition when aEvent happens
    const bounds = cvs.getBoundingClientRect();
    mousePos.x = aEvent.x - bounds.left;
    mousePos.y = aEvent.y - bounds.top;
}

export function cvsPaintMouseMove(aEvent) { //Runs when mouse is moved while mousebutton down on canvas
    setMousePos(aEvent);

    if (currentDrawingObject) {
        if (drawingProperties.shapeType === EShapeType.Pen) {
            currentDrawingObject.addPos(new TPoint(mousePos.x, mousePos.y));
        }

        updateDrawing();
    }
}

export function cvsPaintMouseDown(aEvent) { //Runs when mousebutton is pressed down in canvas

    if (drawingProperties.goodToGo()) {
        if (!currentDrawingObject) {
            currentDrawingObject = new TDrawingObject(mousePos, drawingProperties);
        } else {
            if (aEvent.buttons === 2) {
                drawings.push(currentDrawingObject);
                menuAddPaintShape(currentDrawingObject.name);
                currentDrawingObject.setEnd(mousePos);
                currentDrawingObject = null;
            }
        }
    }
}


export function cvsPaintMouseUp(aEvent) {  //Runs when mousebutton is released
    if (currentDrawingObject) {
        if (drawingProperties.shapeType === EShapeType.Polygon) {
            currentDrawingObject.addPos(new TPoint(mousePos.x, mousePos.y));
        } else {
            drawings.push(currentDrawingObject);
            menuAddPaintShape(currentDrawingObject.name);
            currentDrawingObject.setEnd(mousePos);
            currentDrawingObject = null;
        }
    }
    // Adds the new drawing object/shape to the list
    updateDrawing();
}

console.log("Tegneliste: " + drawings.length.toString());

export function initPaint(aPaintCanvas, aMenuCanvas) {
    //Need this to  provide canvas, and to listen for events to start running functions connected to the mousebutton
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