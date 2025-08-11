const zlib = require("zlib");

    // Function to zip data
    export const zipData = (data) =>
        zlib.deflateSync(Buffer.from(data)).toString("base64");
    
    // Function to unzip data
    export const unzipData = (data) =>
        zlib.inflateSync(Buffer.from(data, "base64")).toString();