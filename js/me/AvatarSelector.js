import { EventDispatcher} from "../EventDispatcher.js";

const imageUpdated = "IMAGE_UPDATED";
const imageAvailable = "IMAGE_AVAILABLE";

class AvatarSelector extends EventDispatcher {
    width = 768;
    height = 768;
    targetEl = null;
    bounds = null;
    canvasEl = null;
    fileField = null;
    sourceImage = null;
    startX = 0;
    offsetX = 0;
    startY = 0;
    offsetY = 0;
    downX = 0
    downY = 0;
    upX = 0;
    upY = 0;
    startAt = 0;
    endAt = 0;
    down = false;

    static get imageAvailable () { return imageAvailable; }
    static get imageUpdated() { return imageUpdated; }

    constructor(targetEl, width, height) {
        super();
        this.targetEl = targetEl;
        this.bounds = targetEl.getBoundingClientRect();
        this.bounds.width = this.bounds.right - this.bounds.left;
        this.bounds.height = this.bounds.bottom - this.bounds.top;
        width = width || this.bounds.width;
        height = height || this.bounds.height;
        this.width = width;
        this.height = height;
        this.init();
    }

    init() {
        this.canvasEl = document.createElement("canvas");
        this.fileField = document.createElement("input");
        this.fileField.type = "file";
        this.fileField.accept = "image/*";
        this.fileField.style.display = "none";
        this.targetEl.appendChild(this.fileField);
        this.targetEl.appendChild(this.canvasEl);

        this.initEvents();
    }

    initEvents() {
        window.addEventListener("drop", function (e) {
            e = e || event;
            e.preventDefault();
        }, false);

        const fileHandler = this.fileSelected.bind(this);
        this.fileField.addEventListener("change", fileHandler);

        const dragEnterHandler = this.dragEnter.bind(this);
        this.targetEl.addEventListener("dragenter", dragEnterHandler);

        const dragLeaveHandler = this.dragLeave.bind(this);
        this.targetEl.addEventListener("dragleave", dragLeaveHandler);

        const dropHandler = this.drop.bind(this);
        this.targetEl.addEventListener("drop", dropHandler);

        const mouseDownHandler = this.mouseDown.bind(this);
        const mouseMoveHandler = this.mouseMove.bind(this);
        const mouseUpHandler = this.mouseUp.bind(this);
        this.canvasEl.addEventListener("mousedown", mouseDownHandler);
        this.canvasEl.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        const touchStartHandler = this.touchStart.bind(this);
        const touchMoveHandler = this.touchMove.bind(this);
        const touchEndHandler = this.touchEnd.bind(this);
        this.canvasEl.addEventListener("touchstart", touchStartHandler);
        this.canvasEl.addEventListener("touchend", touchEndHandler);
        this.canvasEl.addEventListener("touchmove", touchMoveHandler);
    }

    clicked() {
        this.fileField.click();
    }

    fileSelected(e) {
        const file = e.currentTarget.files[0];
        this.readFile(file);
    }

    readFile(file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const that = this;
        // push the image
        reader.onload = () => {
            this.offsetX = 0;
            this.offsetY = 0;
            const image = that.sourceImage = new Image();
            image.src = reader.result;
            image.onload = () => {
                that.redraw();
                that.dispatchEvent(imageAvailable, {});
            }
        }
    }

    redraw(saveFile) {
        saveFile = saveFile || false;
        const image = this.sourceImage;
        const canvas = this.canvasEl;
        let targetImageData = null;

        let imgWidth = image.width;
        let imgHeight = image.height;
        let maxOffsetY = 0;
        let maxOffsetX = 0;

        if (image.height < image.width) {
            let ratio = image.width / image.height;
            imgWidth = this.height * ratio;
            imgHeight = this.height;
            maxOffsetX = this.height - imgWidth;
        } else {
            let ratio = image.height / image.width;
            imgHeight = this.width * ratio;
            imgWidth = this.width;
            maxOffsetY = this.width - imgHeight;
        }

        this.offsetY = Math.min(Math.max(maxOffsetY, this.offsetY), 0);
        this.offsetX = Math.min(Math.max(maxOffsetX, this.offsetX), 0);

        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.width = this.width + "px";
        canvas.style.height = this.height + "px";
        const centerX = Math.round(canvas.width / 2);
        const centerY = Math.round(canvas.height / 2);
        const radius = Math.min(canvas.width, canvas.height)/2 - 10;

        const ctx = canvas.getContext('2d');
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, this.offsetX, this.offsetY, imgWidth, imgHeight);
        if(saveFile)
            targetImageData = canvas.toDataURL("image/jpeg", 1.0);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, this.offsetX, this.offsetY, imgWidth, imgHeight);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        return targetImageData;
    }

    getImageData()
    {
        return this.redraw(true);
    }

    dragEnter(e) {
        this.targetEl.setAttribute("target", "");
        e.dataTransfer.dropEffect = "copy";
    }

    dragLeave(e)
    {
        this.targetEl.removeAttribute("target");
    }

    drop(e)
    {
        if(e.dataTransfer.items && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].type.indexOf("image") === 0)
            this.readFile(e.dataTransfer.files[0]);
        this.targetEl.removeAttribute("target");
    }

    mouseDown(e)
    {
        this.down = true;
        this.startX = e.clientX - this.offsetX;
        this.startY = e.clientY - this.offsetY;
        this.downX = e.clientX;
        this.downY = e.clientY;
        this.startAt = new Date().getTime();
    }

    mouseMove(e)
    {
        if(this.down)
        {
            this.offsetX = e.clientX - this.startX;
            this.offsetY = e.clientY - this.startY;
            this.redraw();
            this.dispatchEvent(imageUpdated, {});
        }
    }

    mouseUp(e)
    {
        this.down = false;
        this.startX = 0;
        this.startY = 0;
        this.upX = e.clientX;
        this.upY = e.clientY;
        this.endAt = new Date().getTime();
        this.isClick();

    }

    touchStart(e)
    {
        e.preventDefault();
        for(let touch of e.changedTouches) {
            this.downX = touch.clientX;
            this.downY = touch.clientY;
            this.startX = touch.clientX - this.offsetX;
            this.startY = touch.clientY - this.offsetY;
            this.startAt = new Date().getTime();
        }
    }

    touchMove(e)
    {
        e.preventDefault();
        for(let touch of e.changedTouches)
        {
            this.offsetX = touch.clientX - this.startX;
            this.offsetY = touch.clientY - this.startY;
            this.redraw();
            this.dispatchEvent(imageUpdated, {});
        }
    }

    touchEnd(e)
    {
        let endX = this.startX;
        let endY = this.startY;
        for(let touch of e.changedTouches)
        {
            this.upX = touch.clientX;
            this.upY = touch.clientY;
        }

        this.upAt = new Date().getTime();
        this.isClick();

        this.startX = 0;
        this.startY = 0;
    }

    isClick()
    {
        const dX = this.upX - this.downX;
        const dY = this.upY - this.downY;
        const distance = Math.sqrt(dX * dX + dY * dY);
        const elapsed = this.endAt - this.startAt;
        if(elapsed < 250 && distance < screen.availWidth * 0.05)
            this.clicked();

        this.downX = this.upX = this.downY = this.upY = 0;
        this.startAt = -1;
        this.endAt = -1;
    }
}

export { AvatarSelector };