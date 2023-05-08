import { TPoint, ctx} from "./GLIB_2D.js";
import {EShapeType} from "./menu.js";

export function TDrawingProperties(aShapeType, aFillStyle, aStrokeStyle, aLineWidth) {

    this.shapeType = aShapeType;
    this.fillStyle = aFillStyle;
    this.strokeStyle = aStrokeStyle;
    this.lineWidth = aLineWidth;

    this.goodToGo = function () {
        return (this.shapeType && this.fillStyle && this.strokeStyle && this.lineWidth);
    };
}

export function TDrawingObject(aStartPos, aDrawingProp) {
    const points = [new TPoint(aStartPos.x, aStartPos.y)];
    const prop = new TDrawingProperties(aDrawingProp.shapeType, aDrawingProp.fillStyle, aDrawingProp.strokeStyle, aDrawingProp.lineWidth);
    let rubberBandPos = aStartPos;

    this.addPos = function (aPoint) {
        points.push(aPoint);
    };

    this.name = Object.keys(EShapeType)[prop.shapeType - 1] + "-" + (drawings.length + 1).toString();


    this.draw = function () {
        ctx.fillStyle = prop.fillStyle;
        ctx.strokeStyle = prop.strokeStyle;
        ctx.lineWidth = prop.lineWidth;

        let endPos = rubberBandPos;
        if (endPos === null) {
            endPos = points[1];
        }

        switch (prop.shapeType) {
            case EShapeType.Pen: // Pen
            case EShapeType.Line: // Line
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                if (rubberBandPos) {
                    ctx.lineTo(rubberBandPos.x, rubberBandPos.y);
                }
                ctx.stroke();
                break;

            case EShapeType.Oval: // Oval
            case EShapeType.Circle: // Circle
                let radius = [Math.abs(endPos.x - points[0].x), 0]
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
                // radius = [posEnd.x - posStart.x, posEnd.y - posStart.y]; cheatSheet 
                ctx.fillRect(points[0].x, points[0].y, size.width, size.height);
                ctx.strokeRect(points[0].x, points[0].y, size.width, size.height);
                break;

            case EShapeType.Polygon:
                let numberOfSides = 6;
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x* Math.cos(i * 2 * Math.PI / numberOfSides), points[i].y * Math.sin(i * 2 * Math.PI / numberOfSides));
                }
                if (rubberBandPos) {
                    ctx.lineTo(rubberBandPos.x, rubberBandPos.y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        };
    };

    this.setEnd = function(aPos){
        points.push(new TPoint(aPos.x, aPos.y));
        rubberBandPos = null;
    }
}