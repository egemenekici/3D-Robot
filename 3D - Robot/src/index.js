var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [

    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0)
];

/*var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),
    vec4(.23, .30, .50, 1.0),
    vec4(.78, .83, 1.0, 1.0),
    vec4(.38, .49, .80, 1.0),
    vec4(.47, .61, 1.0, 1.0),
    vec4(.78, .83, 1.0, 1.0),
    vec4(.23, .30, .50, 1.0),
    vec4(1.0, 1.0, 1.0, 1.0)
];*/

var lX = 0.0, lY = 0.0, lZ = 15.0;
var lightPosition;
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 0.8, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 10000.0;

var torsoId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;


var torsoHeight = 3.0;
var torsoWidth = 1.0;
var upperArmHeight = 3.0;
var lowerArmHeight = 2.0;
var upperArmWidth = 0.5;
var lowerArmWidth = 0.5;
var upperLegWidth = 0.5;
var lowerLegWidth = 0.5;
var lowerLegHeight = 2.0;
var upperLegHeight = 3.0;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 10;
var numAngles = 11;
var angle = 0;

var theta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 0];

var numVertices = 36;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i++) figure[i] = createNode(null, null, null, null);

var modelViewLoc;

var pointsArray = [];
var colorsArray = [];
var normalsArray = [];

var drawMode = 1;

//-------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}


function initNodes(Id) {

    var m = mat4();

    switch (Id) {

        case torsoId:

            m = rotate(theta[torsoId], 0, 1, 0);
            figure[torsoId] = createNode(m, torso, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:


            m = translate(0.0, torsoHeight + 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0))
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            m = mult(m, translate(0.0, 0.5 * headHeight, 0.0));
            figure[headId] = createNode(m, head, leftUpperArmId, null);
            break;


        case leftUpperArmId:

            m = translate(-(torsoWidth + upperArmWidth), 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
            figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId);
            break;

        case rightUpperArmId:

            m = translate(torsoWidth + upperArmWidth, 0.9 * torsoHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
            figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId);
            break;

        case leftUpperLegId:

            m = translate(-(torsoWidth + upperLegWidth), 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftUpperLegId], 1, 0, 0));
            figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId);
            break;

        case rightUpperLegId:

            m = translate(torsoWidth + upperLegWidth, 0.1 * upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
            figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId);
            break;

        case leftLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
            figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null);
            break;

        case rightLowerArmId:

            m = translate(0.0, upperArmHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
            figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null);
            break;

        case leftLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
            figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null);
            break;

        case rightLowerLegId:

            m = translate(0.0, upperLegHeight, 0.0);
            m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
            figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null);
            break;

    }

}

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function torso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(torsoWidth * 2.5, torsoHeight * 1.8, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperArmWidth, upperArmHeight, upperArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerArmWidth, lowerArmHeight, lowerArmWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth))
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    if(drawMode == 1){
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }else{
        for (var i = 0; i < 6; i++) gl.drawArrays(gl.LINE_LOOP, 6 * i, 6);
    }
    //for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);

    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
}


function cube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

var radius = 3.0;
var beta = 0.34,
    phi = 0.50;

var pRadius = 10.0;
var pBeta = 0.34,
    pPhi = 0.50;

var drag = false;
var old_x, old_y;
var dX = 0,
    dY = 0;

var zoom = 0.02;

var fovy = 90.0;
var aspect;

var cLeft = -16,
    cRight = 16,
    cBottom = -9,
    cTop = 9,
    cNear = -10,
    cFar = 10;

    pNear = 1,
    pFar = 100;

var projection = 'orthogonal';

var dRColorLocation, dGColorLocation, dBColorLocation, transparencyLocation;
var dRColor, dGColor, dBColor, transparency;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var move = 0;

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(.0, .0, .0, .0);

    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    cube();

    aspect = canvas.width / canvas.height;

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    this.dRColorLocation = gl.getUniformLocation(this.program, "dRColor");
    this.dGColorLocation = gl.getUniformLocation(this.program, "dGColor");
    this.dBColorLocation = gl.getUniformLocation(this.program, "dBColor");
    this.transparencyLocation = gl.getUniformLocation(this.program, "transparency");

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    for (i = 0; i < numNodes; i++) initNodes(i);

    var mouseDown = function (e) {
        drag = true;
        old_x = e.clientX, old_y = e.clientY;
        e.preventDefault();
        return false;
    };

    var mouseUp = function (e) {
        drag = false;
    };

    var mouseMove = function (e) {
        if (!drag)
            return false;

        dX = (e.pageX - old_x) * 2 * Math.PI / canvas.width,
        dY = (e.pageY - old_y) * 2 * Math.PI / canvas.height;

        beta -= dY;
        phi -= dX;

        pBeta -= dY;
        pPhi -= dX;

        old_x = e.pageX;
        old_y = e.pageY;

        e.preventDefault();
    };

    var mouseWheel = function (e) {
        var delta = 0;

        if (event.wheelDelta) {
            delta = event.wheelDelta / 40;
        } else if (event.detail) {
            delta = -event.detail / 3;
        }

        var width = cRight / zoom;
        var height = cTop / zoom;

        zoom -= delta * 0.001;

        fovy -= event.wheelDeltaY * 0.05;

        cLeft = -zoom * width;
        cRight = zoom * width;
        cTop = zoom * height;
        cBottom = -zoom * height;
    }

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("wheel", mouseWheel, false);

    var flag = 1;

    window.onkeyup = function(){
        document.getElementById("wImg").style.width = "45px";
        document.getElementById("wImg").style.height = "45px";

        document.getElementById("aImg").style.width = "45px";
        document.getElementById("aImg").style.height = "45px";
        
        document.getElementById("sImg").style.width = "45px";
        document.getElementById("sImg").style.height = "45px";
        
        document.getElementById("dImg").style.width = "45px";
        document.getElementById("dImg").style.height = "45px";
    }

    window.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        switch (key) {
            case 'W':

                if (theta[leftUpperLegId] == 180)
                    theta[leftUpperLegId] -= 10;
                else if (theta[leftUpperLegId] == 170)
                    theta[leftUpperLegId] += 20;
                else if (theta[leftUpperLegId] == 190)
                    theta[leftUpperLegId] -= 20;


                if (theta[rightUpperLegId] == 180)
                    theta[rightUpperLegId] += 10;
                else if (theta[rightUpperLegId] == 190)
                    theta[rightUpperLegId] -= 20;
                else if (theta[rightUpperLegId] == 170)
                    theta[rightUpperLegId] += 20;

                initNodes(leftUpperLegId);
                initNodes(rightUpperLegId);

                document.getElementById("wImg").style.width = "48px";
                document.getElementById("wImg").style.height = "48px";

                break;

            case 'A':

                if (theta[rightUpperArmId] == 0)
                    theta[rightUpperArmId] += 10;
                else if (theta[rightUpperArmId] == 10)
                    theta[rightUpperArmId] -= 10;

                initNodes(rightUpperArmId);

                document.getElementById("aImg").style.width = "48px";
                document.getElementById("aImg").style.height = "48px";

                break;

            case 'D':

                if (theta[leftUpperArmId] == 0)
                    theta[leftUpperArmId] += 10;
                else if (theta[leftUpperArmId] == 10)
                    theta[leftUpperArmId] -= 10;

                initNodes(leftUpperArmId);

                document.getElementById("dImg").style.width = "48px";
                document.getElementById("dImg").style.height = "48px";

                break;

            case 'S':

                if (theta[head2Id] == 0 && flag == 1) {
                    theta[head2Id] += 20;
                    initNodes(head2Id);
                    flag = 0;
                } else if (theta[head2Id] == 0 && flag == 0) {
                    theta[head2Id] -= 20;
                    initNodes(head2Id);
                    flag = 1;
                } else if (theta[head2Id] == -20) {
                    theta[head2Id] += 20;
                    initNodes(head2Id);
                } else if (theta[head2Id] == 20) {
                    theta[head2Id] -= 20;
                    initNodes(head2Id);
                }

                document.getElementById("sImg").style.width = "48px";
                document.getElementById("sImg").style.height = "48px";

                break;

            case ' ':
                    console.log(theta[leftLowerLegId])
                    theta[leftLowerLegId] += 90;
                    this.initNodes(leftLowerLegId)

                break;
        }
    };

    $("#option1").click(function () {
        projection = 'orthogonal';
    });
    $("#option2").click(function () {
        projection = 'perspective';
    });
    $("#wireframe").click(function () {
        drawMode = !drawMode;
    });

    $("#lX").on("input change",function () {
        lX = this.value;
    });

    $("#lY").on("input change",function () {
        lY = this.value;
    });

    $("#lZ").on("input change",function () {
        lZ = this.value;
    });

    $("#dRColor").roundSlider({
        circleShape: "half-top",
        sliderType: "min-range",
        radius: 45,
        width: 10,
        value: 0.0,
        max: 1.0,
        step: 0.01,
        handleShape: "dot",
        handleSize: "+10",
        tooltipFormat: function(){
            return "Red";
        },
        beforeCreate: function (event) {
            dRColor = event.value;
        },
        create: function (event) {
            dRColor = event.value;
        },
        start: function (event) {
            dRColor = event.value;
        },
        stop: function (event) {
            dRColor = event.value;
        },
        change: function (event) {
            dRColor = event.value;
        },
        drag: function (event) {
            dRColor = event.value;
        }
    });
    $("#dGColor").roundSlider({
        circleShape: "half-top",
        sliderType: "min-range",
        radius: 45,
        width: 10,
        value: 0.30,
        max: 1.0,
        step: 0.01,
        handleShape: "dot",
        handleSize: "+10",
        tooltipFormat: function(){
            return "Green";
        },
        beforeCreate: function (event) {
            dGColor = event.value;
        },
        create: function (event) {
            dGColor = event.value;
        },
        start: function (event) {
            dGColor = event.value;
        },
        stop: function (event) {
            dGColor = event.value;
        },
        change: function (event) {
            dGColor = event.value;
        },
        drag: function (event) {
            dGColor = event.value;
        }
    });
    $("#dBColor").roundSlider({
        circleShape: "half-top",
        sliderType: "min-range",
        radius: 45,
        width: 10,
        value: 0.52,
        max: 1.0,
        step: 0.01,
        handleShape: "dot",
        handleSize: "+10",
        tooltipFormat: function(){
            return "Blue";
        },
        beforeCreate: function (event) {
            dBColor = event.value;
        },
        create: function (event) {
            dBColor = event.value;
        },
        start: function (event) {
            dBColor = event.value;
        },
        stop: function (event) {
            dBColor = event.value;
        },
        change: function (event) {
            dBColor = event.value;
        },
        drag: function (event) {
            dBColor = event.value;
        }
    });
    $("#transparency").roundSlider({
        circleShape: "half-top",
        sliderType: "min-range",
        radius: 45,
        width: 10,
        value: 0.0,
        max: 0.7,
        step: 0.01,
        handleShape: "dot",
        handleSize: "+10",
        tooltipFormat: function(){
            return "Trans";
        },
        beforeCreate: function (event) {
            transparency = event.value;
        },
        create: function (event) {
            transparency = event.value;
        },
        start: function (event) {
            transparency = event.value;
        },
        stop: function (event) {
            transparency = event.value;
        },
        change: function (event) {
            transparency = event.value;
        },
        drag: function (event) {
            transparency = event.value;
        }
    });
    $("#lightPosition").roundSlider({
        sliderType: "min-range",
        circleShape: "custom-quarter",
        min: -18,
        max: 18,
        value: 0,
        step: 0.35,
        startAngle: 45,
        tooltipFormat: function(){
            return "Light Position";
        },
        radius: 200,
        width: 10,
        handleShape: "dot",
        handleSize: "+10",
        beforeCreate: function (event) {
            lX = event.value;
            lY = event.value;
        },
        create: function (event) {
            lX = event.value;
            lY = event.value;
        },
        start: function (event) {
            lX = event.value;
            lY = event.value;
        },
        stop: function (event) {
            lX = event.value;
            lY = event.value;
        },
        change: function (event) {
            lX = event.value;
            lY = event.value;
        },
        drag: function (event) {
            lX = event.value;
            lY = event.value;
        }
    });

    render();
}

var render = function () {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);

    if (!drag) {
        dX *= .95, dY *= .95;
        beta += dY;
        phi -= dX;
        pBeta += dY;
        pPhi -= dX;
    }

    if (projection == 'perspective') {

        eye = vec3(pRadius * Math.sin(pPhi), pRadius * Math.sin(pBeta), pRadius * Math.cos(pPhi));
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = perspective(fovy, 1.5, pNear, pFar);
        document.getElementById("gl-canvas").style.background = "url('src/2.jpg') no-repeat right top";
        document.getElementById("gl-canvas").style.backgroundSize = "100% 100%";       
    }
   
    if (projection == 'orthogonal') {

        eye = vec3(radius * Math.sin(phi), radius * Math.sin(beta), radius * Math.cos(phi));
        modelViewMatrix = lookAt(eye, at, up);
        projectionMatrix = ortho(cLeft, cRight, cBottom, cTop, cNear, cFar);
        document.getElementById("gl-canvas").style.background = "url('src/1.jpg') no-repeat right top";
        document.getElementById("gl-canvas").style.backgroundSize = "100% 100%";
        document.getElementById("gl-canvas").style.border = "3px";
    }

    lightPosition = vec4(lX, lY, lZ, 0.0 );

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(this.program, "move"), move);
    gl.uniform1f(gl.getUniformLocation(this.program, "lX"), lX);
    gl.uniform1f(gl.getUniformLocation(this.program, "lY"), lY);
    gl.uniform1f(gl.getUniformLocation(this.program, "lZ"), lZ);

    gl.uniform1f(dRColorLocation, dRColor);
    gl.uniform1f(dGColorLocation, dGColor);
    gl.uniform1f(dBColorLocation, dBColor);
    gl.uniform1f(transparencyLocation, transparency);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    traverse(torsoId);
    requestAnimFrame(render);
}