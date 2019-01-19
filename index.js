const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

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

//Check extension of file
function checkExt(file, codecCopyArr, convertArr, format){

    let ext = path.extname(file).slice(1);

    let fileName = file.slice(0, -4)
    let outputFile = fileName + '.mp4';
    let videoFormats = ['mkv', 'mov', 'mp4', 'avi', 'wmv', 'mpeg'];

    if(videoFormats.includes(ext)){
      if (ext != format){
        if((ext == 'mkv' || ext == 'mov' || ext == 'mp4') && (format == 'mkv' || format == 'mov' || format == 'mp4')){
          console.log('converting from mkv');
          codecCopyArr.push(file)
        }else{
          convertArr.push(file);
          console.log('avi')
        }
      }
    }


    return outputFile;
}

//Processes one conversion at a time
function processConvert(convertArr, format){
  const q = new Promise((resolve, reject) => {
    let video = convertArr.pop()
    if(video){
      console.log(video + ' started!')
      convert(video, format)
      .then(() => {

        console.log('one done');
        processConvert(convertArr, format);

      })
    }else{
      console.log('Convert Finished')
      resolve();
    }
  })
  return q;
}

//Process five codec copies at once
function process(codecCopyArr, convertArr, format){
  const v = new Promise((resolve, reject) => {
    console.log(convertArr)
    let fiveArray = codecCopyArr.splice(0,5);
    if(fiveArray.length > 0){
      codecCopy(fiveArray, format)
      .then(() => {
        process(codecCopyArr, convertArr, format);

      })
    }else{
      console.log('Codec Copy Finished')
      processConvert(convertArr, format).then(() => {
        resolve();
      });
    }
  })
  return v;
}


//Function for unwrapping mkv containers
function codecCopy(fiveArray, format){

  const p = new Promise((resolve, reject) => {
    let counter = 0;
    for(let i = 0; i < fiveArray.length;i++){
      let fileName = fiveArray[i].slice(0, -4)
      let outputFile = fileName + "." + format;
      console.log(outputFile);

      ffmpeg(fiveArray[i])
        .outputOptions('-codec copy')

        .on('progress', function(info) {
          console.log('progress ' + info.percent + '%');
          })
          .on('error', function(err){
            console.log('Error: ' + err.message);
            resolve();
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
function convert(inputVideo, format){
  const a = new Promise((resolve, reject) => {
      let fileName = inputVideo.slice(0, -4)
      let outputFile = fileName + "." + format;
      console.log(outputFile);

      ffmpeg(inputVideo)

      .on('progress', function(info) {
        console.log('progress ' + info.percent + '%');
        })
        .on('error', function(err){
          console.log('Error: ' + err.message);
          resolve();
        })
        .on('end', function(){
          console.log('done avi');
          resolve();
          })
        .save(outputFile)

    })
    return a;
}



//Main function to call
function traverseConverter(startFolder, format){
let codecCopyArr = [];
let convertArr = [];
let allFiles = [];
  let traverseResults = traverse(startFolder, allFiles)

  allFiles.forEach(file => {
    let filePath = file;
    let output = checkExt(filePath, codecCopyArr, convertArr, format);
    return output;
  })
  process(codecCopyArr, convertArr, format);
}


module.exports = traverseConverter;
