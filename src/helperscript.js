// Selektovanje DOM elemenata
const canvas = document.querySelector("canvas");
const toolOptions = document.querySelectorAll(".tools-board .tool");
const fillShapeCheckbox = document.querySelector("#fill-shape");
const sizeSlider = document.querySelector("#size-slider");
const colorButtons = document.querySelectorAll(".colors .option");
const customColor = document.querySelector("#custom-color");
const undoredoButtons = document.querySelectorAll(".actions-toolbar li");
const clearCanvasButton = document.querySelector(".clear");
const saveImageButton = document.querySelector(".save");
const context = canvas.getContext("2d");

// Draw state
let drawingHistory = [];
let redoHistory = [];
let currentStep = 0;
let isDrawing = false;
let brushSize = 5;
let selectedColor = "#000";
let selectedTool = "brush";
let prevMousePoint = { x: 0, y: 0 };
let canvasSnapshot = null;

// Canvas Init
const initCanvas = () => {
  document.documentElement.style.setProperty('--doc-height', `${window.innerHeight}px`);
  const dpr = window.devicePixelRatio || 1;
  const canvasRect = canvas.getBoundingClientRect();
  canvas.width = canvasRect.width * dpr;
  canvas.height = canvasRect.height * dpr;
  context.scale(dpr, dpr);
}

// Canvas reset
const resetCanvas = () => {
  initCanvas();
  context.fillStyle = "#fff";
  context.fillRect(0,0, canvas.width, canvas.height);
  drawingHistory.push(localStorage.getItem("savedDrawing") || canvas.toDataURL());
}

const getImageSize = (image) => {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const canvasRect = canvas.getBoundingClientRect();
  const aspectRatio = image.width / image.height;
  const newWidth = canvasRect.width;
  const newHeight = newWidth / aspectRatio;
  return { newWidth, newHeight };
}

// Ucitavanje crteza iz local storagea na canvas
const loadLocalStorageDrawing = () => {
  const savedDrawing = localStorage.getItem("savedDrawing");
  if (!savedDrawing) return;

  const image = new Image();
  image.src = savedDrawing;
  image.onload = () => {
    const { newWidth, newHeight } = getImageSize(image);
    context.drawImage(image, 0, 0, newWidth, newHeight);
  }
}

// Cuvanje crteza na local storage
const saveDrawingToLocalStorage = () => {
  const canvasDrawing = canvas.toDataURL();
  localStorage.setItem("savedDrawing", canvasDrawing);
}

// Cuvanje stanje crteza po varijablama
const saveDrawingState = () => {
  if (currentStep < drawingHistory.length - 1) {
    drawingHistory = drawingHistory.slice(0, currentStep + 1);
  }
  currentStep++;
  drawingHistory.push(canvas.toDataURL());
  redoHistory = [];
  saveDrawingToLocalStorage();
}

// Dvojna funkcionalnost za undo i redo
const activateUndoRedo = (selectedButton) => {
  if (selectedButton.id === "undo" && currentStep > 0) {
    currentStep--;
    redoHistory.push(drawingHistory[currentStep + 1]);
  } else if (selectedButton.id === "redo" && redoHistory.length > 0) {
    currentStep++;
    drawingHistory.push(redoHistory.pop());
  } else {
    return;
  }

  const image = new Image();
  image.src = drawingHistory[currentStep];
  image.onload = () => {
    const { newWidth, newHeight } =getImageSize(image);
    context.drawImage(image, 0, 0, newWidth, newHeight);
    saveDrawingToLocalStorage();
  }
}

// Uzimanje trenutne lokacije kursora
const cursorLocation = (e) => {
  let x = ("ontouchstart" in window ? e.touches?.[0]?.pageX : e.pageX) - canvas.offsetLeft;
  let y = ("ontouchstart" in window ? e.touches?.[0]?.pageY : e.pageY) - canvas.offsetTop;
  return { x, y };
}

// Crtanje Linije
const drawLine = (position) => {
  context.beginPath();
  context.moveTo(prevMousePoint.x, prevMousePoint.y);
  context.lineTo(position.x, position.y);
  context.stroke();
}

// Crtanje pravougaonika
const drawRect = (position) => {
  context.beginPath();
  const width = position.x - prevMousePoint.x;
  const height = position.y - prevMousePoint.y;
  context.rect(prevMousePoint.x, prevMousePoint.y, width, height);
  //za fill
  fillShapeCheckbox.checked ? context.fill() : context.stroke();
  context.closePath();
}

// Crtanje kruga
const drawCircle = (position) => {
  context.beginPath();
  let r = Math.sqrt(Math.pow((prevMousePoint.x - position.x), 2) + Math.pow((prevMousePoint.y - position.y)), 2);
  context.arc(prevMousePoint.x, prevMousePoint.y, r, 0, 2* Math.PI);

  fillShapeCheckbox.checked ? context.fill() : context.stroke();
}
