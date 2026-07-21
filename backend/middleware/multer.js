import multer from 'multer';
import path from "path";

// fs is file system
import fs from "fs";



const uploadDir = "uploads";

// ensures the upload folder exists
if(!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}


// multer setup 
const storage =  multer.diskStorage({
    destination: function(req, file ,cb){
        cb(null, uploadDir);
    },

    /// give file a unique name 
    filename: function(req , file , cb){
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null , uniqueName + path.extname(file.originalname)
        )
    },
});

// file filter 
// if donest from below file type then reject it 
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" || 
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/webp"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are required"), false);
    }
};


// multer config

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024   // 5mb limit 
    },
});


export default upload;




