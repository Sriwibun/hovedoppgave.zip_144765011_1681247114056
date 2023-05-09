"use strict"
import { TPoint, } from "./GLIB_2D.js";
import { initMenu, createMenu, EButtonState, EColorType, EStrokeSizeType, EShapeType, EActionType } from "./menu.js";
import { TDrawingObject } from "./drawingObject.js";



let cvs = null;
let ctx = null;
let divPaintObject = null;

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let drawingObject = new TDrawingObject();
let currentDrawingObject = null;
const drawingObjectList = [];



const NewLine = "<br />";
const txtLog = document.getElementById("txtLog");
const mousePos = new TPoint(0, 0);
const drawingList = [];

//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------------
//------ Function and Events
//------------------------------------------------------------------------------------------------------------------

function drawStraightLine() {

    let startX = 0;
    let startY = 0;

    cvs.addEventListener("mousedown", function (event) {
        startX = mousePos.x;
        startY = mousePos.y;

        cvs.addEventListener("mousemove", drawLine);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawLine);
    });

    function drawLine(event) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
    }

}
function drawFreehand() {

    let startX = 0;
    let startY = 0;

    cvs.addEventListener("mousedown", function (event) {
        startX = mousePos.x;
        startY = mousePos.y;

        cvs.addEventListener("mousemove", drawLine);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawLine);
    });

    function drawLine(event) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        setMousePos();
        cvsPaintMouseMove();
        cvsPaintMouseDown();
        cvsPaintMouseUp();

        ctx = cvs.getContext("2d");
        cvs.addEventListener("mousemove", cvsPaintMouseMove);
        cvs.addEventListener("mousedown", cvsPaintMouseDown);
        cvs.addEventListener("mouseup", cvsPaintMouseUp);
    }
}

function drawCircle() {

    let centerX = 0;
    let centerY = 0;

    cvs.addEventListener("mousedown", function (event) {
        centerX = mousePos.x;
        centerY = mousePos.y;

        cvs.addEventListener("mousemove", drawCircle);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawCircle);
    });

    function drawCircle(event) {
        const radius = Math.sqrt(
            Math.pow(centerX - mousePos.x, 2) + Math.pow(centerY - mousePos.y, 2)
        );

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    }
}


function drawOval() {

    let centerX = 0;
    let centerY = 0;
    cvs.addEventListener("mousedown", function (event) {
        centerX = mousePos.x;
        centerY = mousePos.y;

        cvs.addEventListener("mousemove", drawOval);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawOval);
    });

    function drawOval(event) {
        let radiusX = Math.sqrt(Math.pow(centerX - mousePos.x, 2) + Math.pow(centerY - mousePos.y, 2)) / 2;
        let radiusY = Math.sqrt(Math.pow(centerX - mousePos.x, 2) + Math.pow(centerY - mousePos.y, 2));

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function drawRectangle() {

    let lastX = 0;
    let lastY = 0;

    cvs.addEventListener("mousedown", function (event) {
        lastX = mousePos.x;
        lastY = mousePos.y;

        cvs.addEventListener("mousemove", drawRect);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawRect);
    });

    function drawRect(event) {

        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.beginPath();
        ctx.rect(mousePos.x, mousePos.y, lastX - mousePos.x, lastY - mousePos.y);
        ctx.stroke();
    }
}

function drawPolygon() {

    let centerX = 0;
    let centerY = 0;

    cvs.addEventListener("mousedown", function (event) {
        centerX = mousePos.x;
        centerY = mousePos.y;

        cvs.addEventListener("mousemove", drawPoly);
    });

    cvs.addEventListener("mouseup", function () {
        cvs.removeEventListener("mousemove", drawPoly);
    });


    function drawPoly(event) {

        let numberOfSides = 6;
        ctx.beginPath();
        ctx.moveTo(centerX + mousePos.x * Math.cos(0), centerY + mousePos.y * Math.sin(0));

        for (var i = 1; i <= numberOfSides; i += 1) {
            ctx.lineTo(centerX + mousePos.x * Math.cos(i * 2 * Math.PI / numberOfSides), centerY + mousePos.y * Math.sin(i * 2 * Math.PI / numberOfSides));
        }
        ctx.stroke();
    }
}

function addLogText(aText) {
    if (txtLog.innerHTML.length > 0) {
        txtLog.innerHTML += NewLine;
    }
    txtLog.innerHTML += aText;
}

function newDrawing() {
    addLogText("New Drawing!");
    updateDrawing();
}

function updateDrawing() {
    ctx.clearRect(0, 0, cvsPaint.width, cvsPaint.height);
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

    setMenuChoices(aContainerKey, aButtonKey, aButtonValue);
    chooseShape(aButtonKey);
}

function setMenuChoices(aContainerKey, aButtonKey, aButtonValue) {
    if (aContainerKey === "StrokeColor" && EColorType[aButtonKey]) {
        ctx.strokeStyle = EColorType[aButtonKey];
    }

    if (aContainerKey === "FillColor" && EColorType[aButtonKey]) {
        ctx.fillStyle = EColorType[aButtonKey];
    }

    if (aContainerKey === "StrokeSize" && EStrokeSizeType[aButtonKey]) {
        ctx.lineWidth = EStrokeSizeType[aButtonKey];
    }

    if ((aContainerKey === "Action") && (aButtonKey === "New")) {
        newDrawing();
    }

    if ((aContainerKey === "Action") && (aButtonKey === "Eraser")) {
        drawingList.pop();
    }
}

function chooseShape(aButtonKey) {
    //currentDrawingObject = new TDrawingObject(aButtonKey);
    if (aButtonKey === "Line") {
        drawStraightLine();
    } else if (aButtonKey === "Pen") {
        drawFreehand();
    } else if (aButtonKey === "Circle") {
        drawCircle();
    } else if (aButtonKey === "Oval") {
        drawOval();
    } else if (aButtonKey === "Rectangle") {
        drawRectangle();
    } else if (aButtonKey === "Polygon") {
        drawPolygon();
    }
}



function setMousePos(aEvent) {
    const bounds = cvs.getBoundingClientRect();
    mousePos.x = aEvent.clientX - bounds.left;
    mousePos.y = aEvent.clientY - bounds.top;
}

export function cvsPaintMouseMove(aEvent) {      // denne kjører setMousePos når cvsPaintMouseMove blir ropt på
    // Mouse move over canvas
    setMousePos(aEvent);

    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
    lastX = mousePos.x
    lastY = mousePos.y;
}

export function cvsPaintMouseDown() { // denne må kjøre igang hele tegnefunksjonen
    // Mouse button down in canvas
    isDrawing = true;
    lastX = mousePos.x;
    lastY = mousePos.y;
    console.log("klikk")
}

export function cvsPaintMouseUp(aEvent) {  // denne stopper tegningen
    // Mouse button up in canvas
    isDrawing = false;
    console.log("ferdig klikk");
    //her legger du til tegnede objekter
    //drawingList.push(new TDrawingObject(ctx, ));
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