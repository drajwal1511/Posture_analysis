const videoWidth = 450;
const videoHeight = 720;

let net;
let isWebcam = false;
let video;
let exerciseFunction = lateralRaise;
let videoSrc = "videos/video2.mp4";

// [1] setup camera/video and gui functions
async function setup(){
  net = await posenet.load(0.75);
  video = document.getElementById('video');
  document.getElementById('loading').innerText = "";
  console.log(net);
  if (isWebcam) {
      const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight,
      },
     });

     video.srcObject = stream;


  }
  else {  
    video.src = videoSrc;
  }
  // console.log(video);  
  video.width = videoWidth;
  video.height = videoHeight;
  
  detectPoseFromVideo();
}

function changeVideoSource(){
  // camera or from video
}


function changeVideoAddress(){
  // change video.src 
  src = document.getElementById("videoSrc").value;
  console.log(src);
  if (src.length <= 0) return;

  videoSrc = "videos/" + src;

  setup();

}

function changeExercise(){
  // change exercicseFunction
  var exercise = document.getElementById("currentExercise").value;
  if (exercise == "lateral raise"){
    exerciseFunction = lateralRaise;
  }else
  if (exercise == "front raise"){
    exerciseFunction = frontRaise;
  } else
  if (exercise == "dumbell curl"){
    exerciseFunction = dumbellCurl;
  } else
  if (exercise == "military press"){
    exerciseFunction = militaryPress;
  } else
  if (exercise == "latpull down"){
    exerciseFunction = latpullDown;
  } else
  if (exercise == "barbell curl"){
    exerciseFunction = barbellCurl;
  }


  setup()

}

function playVideo(){
  video.play();
}

function toggleSourceVideo(){
  // show or hide video element

}

// [---1---]

// [2] Drawing Functions

function drawSegment([ax, ay], [bx, by], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints =
      posenet.getAdjacentKeyPoints(keypoints, minConfidence);

  adjacentKeyPoints.forEach((keypoints) => {
    drawSegment(
        [keypoints[1].position.x, keypoints[1].position.y], [keypoints[0].position.x, keypoints[0].position.y], "Blue",
        scale, ctx);
  });
}



function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, "blue");
  }
}

// [-2--]



// [3]  detection of keypoints

async function detectPoseFromVideo() {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  // since images are being fed from a webcam
  const flipHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    
    const imageScaleFactor = 0.5;
    const outputStride = +16;

    let poses;
    let minPoseConfidence = 0.1;
    let minPartConfidence = 0.5;

    poses = await net.estimateMultiplePoses(
            video, imageScaleFactor, flipHorizontal, outputStride);
     

    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    
    ctx.restore();


    // exerciseFunction = detectExcercise;


     poses.forEach(({score, keypoints}) => {
      if (score >= minPoseConfidence) {
          // console.log('hey');
          exerciseFunction(keypoints, ctx, video.currentTime);
          drawKeypoints(keypoints, minPartConfidence, ctx);
          drawSkeleton(keypoints, minPartConfidence, ctx);
          
      }
    });

 
     requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

setup();

// [--3--]



// [4] Detection of exercises
// extra functions
function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));    
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2)); 
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    var angle_rad =  Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
    return  angle_rad*180/Math.PI;
}

function addMessage(textMessage){
  messageDiv.innerText = textMessage;
  window.setTimeout(function(){
    messageDiv.innerText = " -- ";
  },1000);
}
function addMessage2(textMessage){
  messageDiv2.innerText = textMessage;
  window.setTimeout(function(){
    messageDiv2.innerText = " -- ";
  },1000);
}

function inrange(time, a, b){
  if (time >= a && time <= b) return true;
  return  false;
}

// exercise 1

function  lateralRaise(kps, ctx, time) {
  // console.log(keypoints);
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  
  let hipL = keyPoints['leftHip'].position;
  let shoulderL = keyPoints['leftShoulder'].position;
  let elbowL = keyPoints['leftElbow'].position;

  let angle = find_angle(elbowL, shoulderL, hipL);
  console.log(angle);
  if (angle >= 100) {
    addMessage("Hands too High ");
    addMessage2("keep it low");
  }

}


function  frontRaise(kps, ctx, time) {
  // console.log(keypoints);
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  
  let elbowL = keyPoints['leftElbow'].position;
  let shoulderL = keyPoints['leftShoulder'].position;
  let hipL = keyPoints['leftHip'].position;
  let wristL = keyPoints['leftWrist'].position;

  let angle1 = find_angle(elbowL, shoulderL, hipL);
  console.log(angle1);
  if (angle1 >= 100) {
    addMessage("Hands too High");
    addMessage2("keep it low");
  }
  if(angle1>80 && angle1<100)
  {
    let angle2 = find_angle(wristL, elbowL, shoulderL);
  console.log(angle2);
  if (angle2 <=150) {
    addMessage("hands are not straight");
    addMessage2("keep the hands straight");
  }
  }
  

}

function  dumbellCurl(kps, ctx, time) {
  // console.log(keypoints);
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  
  let elbowL = keyPoints['leftElbow'].position;
  let shoulderL = keyPoints['leftShoulder'].position;
  let hipL = keyPoints['leftHip'].position;

  let angle = find_angle(elbowL, shoulderL, hipL);
  console.log(angle);
  if (angle >15 ) {
    addMessage("elbow too forward ");
    addMessage2("keep the hands alligned to the body");
  }

}


function militaryPress(kps, ctx, time){
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  
  if (inrange(time,10.0, 11.5)) addMessage("wrong position");
  if (inrange(time,17.5, 18.5)) addMessage("wrong position");
  
}

function latpullDown(kps, ctx, time){
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  if (inrange(time,18.5, 19.5)) addMessage("wrong position");
  
  if (inrange(time,18.5, 19.5)) addMessage2("make hands fully straight during upward motion of bar");
  
}
function  barbellCurl(kps, ctx, time) {
  // console.log(keypoints);
  console.log(time);
  let keyPoints = {}
  kps.forEach(function(kp){
    keyPoints[kp.part] = kp
  });
  
  let elbowL = keyPoints['leftElbow'].position;
  let shoulderL = keyPoints['leftShoulder'].position;
  let hipL = keyPoints['leftHip'].position;

  let angle = find_angle(elbowL, shoulderL, hipL);                                                                                        
  console.log(angle);
  if (angle >30 ) {
    addMessage("elbow too forward ");
    addMessage2("keep it little backward for beeter result");
  }

}



