"use strict";
import {GLIB_2D_Init, TPoint, TSprite} from "./GLIB_2D.js";
export const EButtonState = {Normal: 0, Hover: 1, Active: 2 };
export const EContainerType = { Action: 1, Toggle: 2, Check: 3 };
let cvs = null;
let ctx = null;

const paintObjectList = document.getElementById("paintObjectList");

const menuMousePos = new TPoint(0, 0);


const PaintSheet = {
    // Draw Color Buttons
    ColorButton: {
        Black: { x: 0, y: 0, width: 40, height: 40, count: 3 },
        White: { x: 0, y: 40, width: 40, height: 40, count: 3 },
        Gray: { x: 0, y: 80, width: 40, height: 40, count: 3 },
        Burgundy: { x: 0, y: 120, width: 40, height: 40, count: 3 },
        Red: { x: 0, y: 160, width: 40, height: 40, count: 3 },
        Yellow: { x: 0, y: 200, width: 40, height: 40, count: 3 },
        Green: { x: 0, y: 240, width: 40, height: 40, count: 3 },
        Azure: { x: 0, y: 280, width: 40, height: 40, count: 3 },
        Blue: { x: 0, y: 320, width: 40, height: 40, count: 3 },
        Purple: { x: 0, y: 360, width: 40, height: 40, count: 3 }
    },
    // Stroke thickness Buttons
    StrokeSizeButton: {
        Thin: { x: 0, y: 400, width: 40, height: 40, count: 3, },
        Medium: { x: 0, y: 440, width: 40, height: 40, count: 3 },
        Thick: { x: 0, y: 480, width: 40, height: 40, count: 3 }
    },
    // Shape type buttons
    ShapeTypeButton: {
        Line: { x: 0, y: 520, width: 40, height: 40, count: 3 },
        Pen: { x: 0, y: 560, width: 40, height: 40, count: 3 },
        Circle: { x: 0, y: 600, width: 40, height: 40, count: 3 },
        Oval: { x: 0, y: 640, width: 40, height: 40, count: 3 },
        Rectangle: { x: 0, y: 680, width: 40, height: 40, count: 3 },
        Polygon: { x: 0, y: 720, width: 40, height: 40, count: 3 }
    },
    // Action Buttons
    ActionButton: {
        // New Button
        New: { x: 0, y: 880, width: 40, height: 40, count: 3 },
        // Eraser button
        Eraser: { x: 0, y: 760, width: 40, height: 40, count: 3 },
        // Stack move up button
        MoveUp: { x: 0, y: 800, width: 40, height: 40, count: 3 },
        // Stack move down button
        MoveDown: { x: 0, y: 840, width: 40, height: 40, count: 3 }
    }
};

export const EColorType = {
    Black: "#000000",
    White: "#ffffff",
    Gray: "#7f7f7f",
    Burgundy: "#880015",
    Red: "#ed1c24",
    Yellow: "#fff200",
    Green: "#22b14c",
    Azure: "#00a2e8",
    Blue: "#3f48cc",
    Purple: "#a349a4"
};

export const EStrokeSizeType = {
    Thin: 1,
    Medium: 3,
    Thick: 5
};

const EShapeType = {
    Line: 1,
    Pen: 2,
    Circle: 3,
    Oval: 4,
    Rectangle: 5,
    Polygon: 6
};

const EActionType = {
    New: 1,
    Eraser: 2,
    MoveUp: 3,
    MoveDown: 4
};


const ContainerButtons = {
    Action: {
        caption: "   New      Delete      Up     Down   ",
        buttons: PaintSheet.ActionButton,
        Type: EContainerType.Action,
        pos: { x: 0, y: 0 },
        valueList: EActionType
    },
    StrokeColor: {
        caption: "Stroke Color",
        buttons: PaintSheet.ColorButton,
        Type: EContainerType.Toggle,
        pos: { x: 190, y: 0 },
        valueList: EColorType
    },
    StrokeSize: {
        caption: "Stroke Size",
        buttons: PaintSheet.StrokeSizeButton,
        Type: EContainerType.Toggle,
        pos: { x: 633, y: 0 },
        valueList: EStrokeSizeType
    },
    ShapeType: {
        caption: "Draw Shape",
        buttons: PaintSheet.ShapeTypeButton,
        Type: EContainerType.Toggle,
        pos: { x: 0, y: 55 },
        valueList: EShapeType
    },
    FillColor: {
        caption: "Fill Color",
        buttons: PaintSheet.ColorButton,
        Type: EContainerType.Toggle,
        pos: { x: 275, y: 55 },
        valueList: EColorType
    }

};


const containers = [];

//------------------------------------------------------------------------------------------------------------------
//------ Classes
//------------------------------------------------------------------------------------------------------------------

function TContainerButton(aContainerInfo, aClickFunction) {
    const ci = aContainerInfo;
    let onClick = aClickFunction;
    const frame = 5, gap = 3;
    let width = 0, height = 0;
    const buttons = [];
    const caption = { text: ci.caption, x: 0, y: 0, width: ctx.measureText(ci.caption).width, height: 10 };
    let activeButton = null;
    let keys = Object.keys(ci.buttons);
    let clickObject = this;
    for (let i = 0; i < keys.length; i++) {
        const spi = ci.buttons[keys[i]];
        const ptnPos = new TPoint(
            ci.pos.x + frame + (buttons.length * spi.width) + (buttons.length * gap),
            ci.pos.y + frame
        );
        const button = new TButton(ptnPos, spi, aClickFunction);
        buttons.push(button);
        width = ptnPos.x - ci.pos.x + spi.width + frame;
        height = ptnPos.y - ci.pos.y + spi.height + frame + caption.height;
        caption.x = ci.pos.x + (width / 2) - (caption.width / 2);
        caption.y = ci.pos.y + height - frame;
    }

    this.draw = function () {
        //ctx.strokeRect(ci.pos.x, ci.pos.y, width, height);
        ctx.fillStyle = "black";
        ctx.fillText(caption.text, caption.x, caption.y);
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].draw();
        }
    };

    this.mouseOver = function () {
        for (let i = 0; i < buttons.length; i++) {
            if (activeButton !== buttons[i]) {
                if (buttons[i].mouseOver()) {
                    buttons[i].setState(EButtonState.Hover);
                } else {
                    buttons[i].setState(EButtonState.Normal);
                }
            }
        }
    };

    this.click = function () {
        for (let i = 0; i < buttons.length; i++) {
            if (buttons[i].mouseOver()) {
                if (ci.Type === EContainerType.Action) {
                    buttons[i].setState(EButtonState.Active);
                    doClick(i);
                    return true;
                } else {
                    if (activeButton !== buttons[i]) {
                        if (activeButton) {
                            activeButton.setState(EButtonState.Normal);
                        }
                        activeButton = buttons[i];
                        activeButton.setState(EButtonState.Active);
                        doClick(i);
                        return true;
                    }
                }
            }
        }
        return false;
    };

    function doClick(aButtonIndex) {
        if (onClick) {
            const containerIndex = containers.indexOf(clickObject);
            const containerKey = Object.keys(ContainerButtons)[containerIndex];
            const cb = ContainerButtons[containerKey];
            const buttonKey = Object.keys(cb.buttons)[aButtonIndex];
            const buttonValue = cb.valueList[keys[aButtonIndex]];
            onClick(containerKey, buttonKey, buttonValue);
        }
    }

    this.setActive = function (aButtonIndex) {
        if (aButtonIndex < buttons.length) {
            activeButton = buttons[aButtonIndex];
            activeButton.setState(EButtonState.Active);
            doClick(aButtonIndex);
        }
    };

} // end of TContainerButton

function TButton(aPos, aSpriteInfo, aClickFunction) {
    const sprite = new TSprite(aSpriteInfo, aPos);
    const rect = sprite.getRectangle();
    //sp.setScale({x:0.5, y:0.5});
    let state = EButtonState.Normal;
    let onClick = aClickFunction;
    const clickObject = this;

    this.draw = function () {
        sprite.setIndex(state);
        sprite.draw();
    };

    this.setState = function (aState) {
        state = aState;
        this.draw();
    };

    this.mouseOver = function () {
        return rect.checkHitPosition(menuMousePos);
    };

    this.click = function () {
        if (onClick) {
            onClick(clickObject);
        }
    };
} // end of TButton


//------------------------------------------------------------------------------------------------------------------
//------ Function and Events
//------------------------------------------------------------------------------------------------------------------

function drawMenu() {
    paintObjectList.innerHTML = "";
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    for (let i = 0; i < containers.length; i++) {
        containers[i].draw();
    }
}

function setMenuMousePos(aEvent) {
    const bounds = cvs.getBoundingClientRect();
    menuMousePos.x = aEvent.clientX - bounds.left;
    menuMousePos.y = aEvent.clientY - bounds.top;
}

function cvsMenuMouseMove(aEvent) {
    // Mouse move over canvas
    setMenuMousePos(aEvent);
    for (let i = 0; i < containers.length; i++) {
        containers[i].mouseOver();
    }
}

function cvsMenuClick() {
    for (let i = 0; i < containers.length; i++) {
        containers[i].click();
    }
}

function paintObjectClick(aObject) {
    const children = paintObjectList.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child === aObject) {
            if (child.classList.contains("selected")) {
                child.className = "paintObject";
            } else {
                child.className = "paintObject selected";
            }
        } else {
            child.className = "paintObject";
        }
    }
}

function menuGetCurrentPaintShape() {
    const children = paintObjectList.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.classList.contains("selected")) {
            return child.innerText;
        }
    }
    return "";
}

export function menuAddPaintShape(aText) {
    paintObjectList.innerHTML = "<div class=\"paintObject\" onclick=\"return paintObjectClick(this)\">" + aText + "</div>\n" + paintObjectList.innerHTML;
}

export function menuMovePaintShapeDown() {
    const name = menuGetCurrentPaintShape();
    const children = paintObjectList.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.innerText === name) {
            if (i > 0) {
                paintObjectList.insertBefore(children[i], children[i - 1]);
            }
            break;
        }
    }
}

export function menuMovePaintShapeUp() {
    const name = menuGetCurrentPaintShape();
    const children = paintObjectList.children;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.innerText === name) {
            if (i < children.length - 1) {
                paintObjectList.insertBefore(children[i + 1], children[i]);
            }
            break;
        }
    }
}

export function createMenu(aClickFunction) {
    const keys = Object.keys(ContainerButtons);
    for (let i = 0; i < keys.length; i++) {
        containers.push(new TContainerButton(ContainerButtons[keys[i]], aClickFunction));
    }

    // Set default menu selection
    containers[1].setActive(0);  // Stroke color
    containers[2].setActive(3);  // Stroke size
    containers[3].setActive(1);  // Shape type
    containers[4].setActive(0);  // Fill color

    drawMenu();
}


export function initMenu(aCanvas, aReadyCallback) {
    cvs = aCanvas;
    ctx = cvs.getContext("2d"); //Menu context
    ctx.font = "10px Verdana";

    cvs.addEventListener("mousemove", cvsMenuMouseMove);
    cvs.addEventListener("click", cvsMenuClick);
    GLIB_2D_Init(ctx, "./media/SpriteSheet_Paint.png", aReadyCallback);
}

