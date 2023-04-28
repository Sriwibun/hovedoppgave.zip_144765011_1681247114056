"use strict";

export let ctx = null;
let imgSheet = null;

export function TSinesWave(aStarPos, aFrequency, aAmplitude){
    const pos = new TPoint(aStarPos.x, aStarPos.y);
    const freq = aFrequency/10;
    const amp = aAmplitude;
    let rad = 0;

    this.getWaveValue = function(){
        let value = pos.y - amp * Math.sin(rad);
        rad += freq;
        return value;
    }
}// End of class TSineWave


export function TPoint(aX, aY) {
    this.x = aX;
    this.y = aY;
}// End of class TPoint


export function TRectangle(aPos, aWidth, aHeight) {
    const rect = this;
    let pos = aPos;
    this.left = pos.x;
    this.top = pos.y;
    this.width = aWidth;
    this.height = aHeight;
    this.right = rect.left + rect.width;
    this.bottom = rect.top + rect.height;

    this.update = function(){
        rect.left = pos.x;
        rect.top = pos.y;
        rect.width = aWidth;
        rect.height = aHeight;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    }

    this.setPos = function (aPos) {
        pos = aPos;
        update();
    }

    this.setSize = function (aWidth, aHeight) {
        rect.width = aWidth;
        rect.height = aHeight;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    }

    this.checkHitRectangle = function (aRect) {
        rect.update();
        aRect.update();
        return !(rect.bottom < aRect.top || rect.right < aRect.left || rect.top > aRect.bottom || rect.left > aRect.right);
    }

    this.checkHitPosition = function(aPos){
        rect.update();
        return ((aPos.x > rect.left) && (aPos.x < rect.right)) && ((aPos.y > rect.top) && (aPos.y < rect.bottom));
    }

    this.checkHitCircle = function(aPos1, aPos2, aR1, aR2){
        const isInside = this.checkHitPosition(aPos1);
        if(isInside){
            const p1 = aPos1;
            const p2 = aPos2;
            const h = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            return (h > aR1) && (h < aR2);
        }
    }
} // End of class TRectangle

export function TSprite(aSpriteInfo, aPos) {
    const spi = aSpriteInfo;
    const pos = aPos;
    const spriteCount = aSpriteInfo.count;
    let spriteIndex = 0;
    let animationIndex = 0;
    let animationSpeed = 1;
    let alpha = 1;
    const scale = new TPoint(1, 1);

    this.draw = function () {
        const sw = spi.width;
        const sh = spi.height;
        const sx = spi.x + (sw * spriteIndex);
        const sy = spi.y;
        const dx = pos.x;
        const dy = pos.y;
        const dw = Math.floor(sw * scale.x);
        const dh = Math.floor(sh * scale.y);
        const oldAlpha = ctx.globalAlpha;
        ctx.globalAlpha = alpha;
        ctx.drawImage(imgSheet, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.globalAlpha = oldAlpha;
    }

    this.animate = function () {
        animationIndex += animationSpeed;
        if (animationIndex >= spriteCount) {
            animationIndex = 0;
        }
        spriteIndex = Math.floor(animationIndex);
    }

    this.setIndex = function (aIndex) {
        if (aIndex < spriteCount) {
            spriteIndex = aIndex;
        }
    }
    
    this.getIndex = function(){
        return spriteIndex;
    }

    this.setScale = function (aScale) {
        scale.x = aScale;
        scale.y = aScale;
    }

    this.setNonUniScale = function(aPos){
        scale.x = aPos.x;
        scale.y = aPos.y;
    }

    this.setAlpha = function (aAlpha) {
        alpha = aAlpha;
    }

    this.setAnimationSpeed = function(aSpeed){
        animationSpeed = aSpeed;
    }

    this.getRectangle = function(){
        return new TRectangle(pos, spi.width * scale.x, spi.height * scale.y);
    }

}// End of class TSprite

export function GLIB_2D_Init(aCTX, aImageName, aGameReady) {
    ctx = aCTX;
    ctx.eColorType = "black";
    ctx.StrokeSize = 5;
    ctx.fillColor = "Black";
    
    imgSheet = new Image();
    imgSheet.addEventListener("load", aGameReady, false);
    imgSheet.src = aImageName;
}