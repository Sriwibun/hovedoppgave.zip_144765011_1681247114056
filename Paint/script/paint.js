"use strict"
import { TPoint, } from "./GLIB_2D.js";
import {
    initMenu, createMenu, EButtonState, EColorType, EStrokeSizeType, EShapeType, EActionType,
    paintObjectList, paintObjectClick, menuAddPaintShape, menuMovePaintShapeDown, menuMovePaintShapeUp
} from "./menu.js";


let cvs = null;
let ctx = null;
let posX = 0;
let posY = 0;


let drawingProperties = new TDrawingProperties();
let currentDrawingObject = null;

const mousePos = new TPoint(0, 0);
export const drawings = [];


const NewLine = "<br />";
const txtLog = document.getElementById("txtLog");

//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------

const drawing = {
TDrawingProperties: function (aShapeType, aFillStyle, aStrokeStyle, aLineWidth) {

    this.shapeType = aShapeType;
    this.fillStyle = aFillStyle;
    this.strokeStyle = aStrokeStyle;
    this.lineWidth = aLineWidth;

    this.goodToGo = function () {
        return (this.shapeType && this.fillStyle && this.strokeStyle && this.lineWidth);
    };
},


TDrawingObject: function (aStartPos, aDrawingProp) {
    const points = [new TPoint(aStartPos.x, aStartPos.y)];
    const prop = new TDrawingProperties(aDrawingProp.shapeType, aDrawingProp.fillStyle, aDrawingProp.strokeStyle, aDrawingProp.lineWidth);
    let rubberBandPos = aStartPos;


    this.name = Object.keys(EShapeType)[prop.shapeType - 1] + "-" + (drawings.length + 1).toString();

    this.addPos = function (aPoint) {
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
            case EShapeType.Pen: // Pen, hvis 
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            if (rubberBandPos) {
                ctx.lineTo(rubberBandPos.x, rubberBandPos.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;

            case EShapeType.Circle: // Circle
            case EShapeType.Oval: // Oval
                let radius = [Math.abs(endPos.x - points[0].x), 0];
                if (prop.shapeType === EShapeType.Circle) {
                    radius[1] = radius[0];
                } else {
                    radius[1] = Math.abs(endPos.y - points[0].y);
                }

                ctx.beginPath();
                ctx.ellipse(points[0].x, points[0].y, radius[0], radius[1], 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                break;

            case EShapeType.Rectangle: // Rectangle  
                let size = { width: endPos.x - points[0].x, height: endPos.y - points[0].y };
                ctx.fillRect(points[0].x, points[0].y, size.width, size.height);
                ctx.strokeRect(points[0].x, points[0].y, size.width, size.height);
                break;

            case EShapeType.Polygon: //Polygon

                let numberOfSides = 6;
                ctx.beginPath();
                ctx.moveTo(centerX + mousePos.x * Math.cos(0), centerY + mousePos.y * Math.sin(0));

                for (var i = 1; i <= numberOfSides; i += 1) {
                    ctx.lineTo(centerX + mousePos.x * Math.cos(i * 2 * Math.PI / numberOfSides), centerY + mousePos.y * Math.sin(i * 2 * Math.PI / numberOfSides));
                }
                ctx.stroke();
        }
        }
    },
    this:setEnd = function (aPos) {
        points.push(new TPoint(aPos.x, aPos.y));
        rubberBandPos = null;
    }
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

    addLogText("New Drawing!");

    currentDrawingObject = null;
    drawings.length = 0;
    ctx.clearRect(0, 0, cvs.width, cvs.height);
}

function removeObject() {
    const index = menuGetCurrentPaintShape();
    if (index >= 0) {
        paintObjectList.removeChild(paintObjectList.children[index]);

    addLogText("Deleted shape!");



    updateDrawing();
}}
export function menuGetCurrentPaintShape() {
    const children = paintObjectList.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.classList.contains("selected")) {
            return i;
        }
    }
    return -1;
}

paintObjectList.addEventListener("click", (event) => {
    const target = event.target;
    const children = paintObjectList.children;

    if (target.tagName === "LI") {
      const currentIndex = Array.from(children).indexOf(target);

      if (currentIndex > 0) {
        // Move the clicked item up in the list
        paintObjectList.insertBefore(target, children[currentIndex - 1]);
        // Move the corresponding layer up in the layer style
        moveLayerUp(currentIndex);
      } else if (currentIndex < children.length - 1) {
        // Move the clicked item down in the list
        paintObjectList.insertBefore(target, children[currentIndex + 2]);
        // Move the corresponding layer down in the layer style
        moveLayerDown(currentIndex);
      }
    }
  });

  function moveLayerUp(currentIndex) {
    // Move the corresponding layer up in the layer style
    const layer = paintObjectList.children[currentIndex].layer;
    layer.parentNode.insertBefore(layer, layer.previousSibling);
  }

  function moveLayerDown(currentIndex) {
    // Move the corresponding layer down in the layer style
    const layer = paintObjectList.children[currentIndex].layer;
    layer.parentNode.insertBefore(layer.nextSibling, layer);
  }

function updateDrawing() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    for (let i = 0; i < drawings.length; i++) {
        drawings[i].draw();
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

export function cvsPaintMouseDown(aEvent) { // denne må kjøre igang hele tegnefunksjonen
    // Mouse button down in canvas

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


export function cvsPaintMouseUp(aEvent) {  // denne stopper tegningen
    // Mouse button up in canvas
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

    // Adds the new object/shape made to the list

    updateDrawing();
}

console.log("Tegneliste: " + drawings.length.toString());

/*export function drawing(aPaintCanvas){
    cvs = aPaintCanvas;
    ctx = cvs.getContext("2d");
    cvsPaintMouseMove;
    cvsPaintMouseDown;
    cvsPaintMouseUp;
}
*/
export function initPaint(aPaintCanvas, aMenuCanvas) {
    cvs = aPaintCanvas;
    ctx = cvs.getContext("2d");
    cvs.addEventListener("mousemove", cvsPaintMouseMove);
    cvs.addEventListener("mousedown", startDrawing);
    cvs.addEventListener("mouseup", cvsPaintMouseUp);
    
    /* 
        Initialize the menu with canvas for drawing menu items.
        loadPaintApp is the call back when all menuitems has been created
    */ 
    initMenu(aMenuCanvas, loadPaintApp);
}