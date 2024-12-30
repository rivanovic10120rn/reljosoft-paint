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
  const canvasArea = canvas.getBoundingClientRect();
  canvas.width = canvasArea.width * dpr;
  canvas.height = canvasArea.height * dpr;
  context.scale(dpr, dpr);
}

// Canvas reset
