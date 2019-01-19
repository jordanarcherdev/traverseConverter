# Node Traverse Video Converter
A simpleish node.js module for traversing the file system and converting videos to a specified format.

# Usage

Add the module into your functions (Not published on NPM yet) and require into your code. eg. 
```javascript
      const convert = require('./index.js');
      
      let startDirectory = "FOLDER_YOU_WANT_TO_BEGIN_SEARCHING";
      let desiredFormat = "mp4";
      
      //and simply call the function in your code
      convert(startDirectory, desiredFormat);
      
  ```
  
  The module will begin at your start directory and convert all video files from within itself and its child directories.
  
  # Available Formats
  You can convert between MOV/MP4/MKV/AVI/MPEG/WMV
  
  If converting between MOV/MP4/MKV the module will create a codec copy and process up to 5 videos at a time, all other conversions process one video at a time.
  
