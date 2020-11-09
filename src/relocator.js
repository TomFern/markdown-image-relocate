const URL = require("url").URL;
const mktemp = require("mktemp");
const fs = require('fs');
const sha1File = require('sha1-file');
const path = require('path');
const bent = require('bent')


// checksum the files in a folder
async function checksumFolder(folder) {
    const checksums = [];
    if(fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach( f => {   
            checksums.push({
                fn: f,
                checksum: sha1File.sync(path.join(folder, f))
            });
        })
    }
    return checksums;
}

// download urls without duplication
async function downloadUrls(urls, folder) {
    const getBuffer = bent('buffer')

    const downloads = [];
    const checksums = await checksumFolder('img');

    for(let i = 0; i < urls.length; i++) {
        // url withouts the parenthesis
        let url = urls[i].replace('\(','').replace('\)','');

        try {
            new URL(url);
        }
        catch {
            continue;
        }

        // download image file
        let buffer = await getBuffer(url);
        const fext = path.extname(url);
        if(!fs.existsSync(folder)) 
            fs.mkdirSync(folder);
        let fn = mktemp.createFileSync(path.join(folder, 'XXXXXXXX' + fext));
        fs.writeFileSync(fn, buffer);

        // check if exists in folder
        fsum = sha1File.sync(fn);
        const found = checksums.find( f => f.checksum == fsum );
        if(typeof(found) !== 'undefined') {            
            fs.unlinkSync(fn);
            fn = found.fn;
        }
        else {
            let new_name = path.basename(url);
            fs.renameSync(fn, new_name);
            fn = new_name;             
        }

        downloads.push({
            url: url,
            fileName: fn,
            sourceString: urls[i],
            replaceString: '(' + './' + folder + '/' + fn + ')'

        });
    }
    return downloads;
}

// download images from url in Markdown, replace with local files
async function downloadImages(sourceText, folder='.') {
    let reImages = /(?:\((.*?(png|jpg|jpeg|svg))\))/gi;
    const urls = sourceText.match(reImages);
    const downloads = await downloadUrls(urls, folder);
    let returnText = sourceText;
    downloads.forEach( d => {
        returnText = returnText.replace(d.sourceString, d.replaceString);
    });
    return returnText;
}

exports.downloadImages = downloadImages;