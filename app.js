const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const async = require('async');

//Digs through directories until it finds files, builds an object
function traverse(dir, allFiles, result = []) {

    // list files in directory and loop through
    fs.readdirSync(dir).forEach((file) => {

        // builds full path of file
        const fPath = path.resolve(dir, file);

        // prepare stats obj
        const fileStats = { file, path: fPath };

        // is the file a directory ?
        // if yes, traverse it also, if no just add it to the result
        if (fs.statSync(fPath).isDirectory()) {
            fileStats.type = 'dir';
            fileStats.files = [];
            result.push(fileStats);
            return traverse(fPath, allFiles, fileStats.files)
        }

        fileStats.type = 'file';
        result.push(fileStats);
        allFiles.push(fPath);
    });
    return result;
}

function checkExt(file, mkvArray, aviArray){
    let ext = path.extname(file).slice(1);

    let fileName = file.slice(0, -4)
    let outputFile = fileName + '.mp4';

    if(ext == 'mkv' || ext == 'mov' || ext == 'm4v'){
      console.log('converting from mkv');
      mkvArray.push(file)
    }

    if(ext == 'avi'){
      aviArray.push(file);
      console.log('avi')
    }
    return outputFile;
}

function traverseConverter(startFolder){
let mkvArray = [];
let aviArray = [];
let allFiles = [];
  let traverseResults = traverse(startFolder, allFiles)
  console.log(allFiles);

  traverseResults.forEach(show => {
    if(show.files){
      show.files.forEach(season => {
        if(season.files){
          season.files.forEach(episode => {
            let filePath = episode.path;
            let output = checkExt(filePath, mkvArray, aviArray);
            return output;
          })
        }

      })
    }
    console.log('SHOWEND')
  })
  process(mkvArray, aviArray).then(() => {

    processAVI(aviArray);
  });
}
//Function for converting mkvs
function convert(fiveArray){

  const p = new Promise((resolve, reject) => {
    let counter = 0;
    for(let i = 0; i < fiveArray.length;i++){
      let fileName = fiveArray[i].slice(0, -4)
      let outputFile = fileName + '.mp4';
      console.log(outputFile);

      ffmpeg(fiveArray[i])
        .outputOptions('-codec copy')

        .on('progress', function(info) {
          console.log('progress ' + info.percent + '%');
          })
        .on('end', function(){
          console.log('done convert')
          counter++;
          console.log(counter)
          if(counter == fiveArray.length){
            console.log(counter + ' Done')
            resolve();
          }
        })
        .save(outputFile)
    }
  })
  return p;
}

//Function for converting avis one by one
function convertAVI(inputVideo){
  const a = new Promise((resolve, reject) => {
      let fileName = inputVideo.slice(0, -4)
      let outputFile = fileName + '.mp4';
      console.log(outputFile);

      ffmpeg(inputVideo)

      .on('progress', function(info) {
        console.log('progress ' + info.percent + '%');
        })
        .on('end', function(){
          console.log('done avi');
          resolve();
          })
        .save(outputFile)

    })
    return a;
}

function process(mkvArray, aviArray){
  const v = new Promise((resolve, reject) => {
    console.log(aviArray)
    let fiveArray = mkvArray.splice(0,5);
    if(fiveArray.length > 0){
      convert(fiveArray)
      .then(() => {
        process(mkvArray, aviArray);

      })
    }else{
      console.log('all done bro!')
      processAVI(aviArray).then(() => {
        resolve();
      });
    }
  })
  return v;
}

function processAVI(aviArray){
  const q = new Promise((resolve, reject) => {
    let video = aviArray.pop()
    if(video){
      console.log(video + ' started!')
      convertAVI(video)
      .then(() => {

        console.log('one done');
        processAVI(aviArray);

      })
    }else{
      console.log('AVI all done bro!')
      resolve();
    }
  })
  return q;
}

//Begin
let testFolder = './tests'
traverseConverter(testFolder)
