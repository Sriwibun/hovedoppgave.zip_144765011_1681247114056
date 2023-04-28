"use strict"
import {TPoint, } from "./GLIB_2D.js";
import { initMenu, createMenu, EColorType, EStrokeSizeType} from "./menu.js";



//original

let cvs = null;
let ctx = null;
let divPaintObject = null;


const NewLine = "<br />";
const txtLog = document.getElementById("txtLog");
const mousePos = new TPoint(0, 0);

//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------------
//------ Function and Events
//------------------------------------------------------------------------------------------------------------------


   // Variables to keep track of mouse status
   let isDrawing = false;
   let lastX = 0;
   let lastY = 0;

    // Function to start drawing
    function startDrawing(event) {
      isDrawing = true;
      lastX = mousePos.x;
      lastY = mousePos.y;
    }
    
    // Function to stop drawing
    function stopDrawing() {
      isDrawing = false;
    }
    
    // Function to draw when mouse is moved
    function draw(event) {
      if (!isDrawing) return;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(mouseos.x, mousePos.y);
      ctx.stroke();
      lastX = mousePos.x;
      lastY = mousePos.y;
    }
    
    // Add event listeners to canvas

function addLogText(aText) {
    if (txtLog.innerHTML.length > 0) {
        txtLog.innerHTML += NewLine;
    }
    txtLog.innerHTML += aText;
}

function newDrawing() { //clears canvas and starts new drawing
    addLogText("New Drawing!");
    updateDrawing();
}

function updateDrawing() { //just clears the canvas
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

    if (aContainerKey === "StrokeColor" && strokeColors[aButtonKey]) {
        ctx.strokeStyle = strokeColors[aButtonKey];
      }
    if (aContainerKey === "StrokeSize" && strokeSize[aButtonKey]) {
        ctx.lineWidth = strokeSize[aButtonKey];
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

function cvsPaintMouseDown() { // denne må kjøre igang hele tegnefunksjonen
    // Mouse button down in canvas
   isDrawing = true;
   lastX = mousePos.x;
    lastY = mousePos.y;
    console.log("klikk")
}

function cvsPaintMouseUp(aEvent) {  // denne stopper tegningen
    // Mouse button up in canvas
    isDrawing = false;
    console.log("ferdig klikk")
}


export function drawing(aPaintCanvas){
    cvs = aPaintCanvas;
    ctx = cvs.getContext("2d");
    cvsPaintMouseMove;
    cvsPaintMouseDown;
    cvsPaintMouseUp;
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