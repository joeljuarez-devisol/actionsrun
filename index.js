const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

// versionCode — A positive integer [...] -> https://developer.android.com/studio/publish/versioning
const versionCodeRegexPattern = /(versionCode(?:\s|=)*)(.*)/;
// versionName — A string used as the version number shown to users [...] -> https://developer.android.com/studio/publish/versioning
const versionNameRegexPattern = /(versionName(?:\s|=)*)(.*)/;

try {
    const platform = core.getInput('platform');
    if (platform === 'android') {
        const gradlePath = core.getInput('gradlePath');
        const versionName = core.getInput('versionNumber');
        let versionParts = versionName.split('.');

        let finalNewVersion = '';
        let newVersionParts = versionParts[versionParts.length -1];

        let lastPartMayor = 1;
        let lastPartMinor = 0;
        let lastPartVersion = 0;
        if(newVersionParts.length > 2) {
            lastPartMayor = parseInt(versionParts[0]);
            lastPartMinor = parseInt(versionParts[1]);
            lastPartVersion = parseInt(versionParts[2]) + 1;
            
            if(lastPartVersion > 99) {
                lastPartVersion = 0;
                lastPartMinor = lastPartMinor + 1;
                if(lastPartMinor > 99) {
                    lastPartMinor = 0;
                    lastPartMayor = lastPartMayor + 1;
                }
            }
            finalNewVersion = `${lastPartMayor}.${lastPartMinor}.${lastPartVersion}`;
        }

        let versionCode = '';
        let versionFinalParts = finalNewVersion.split('.');
        versionFinalParts.forEach(element => {
            let newPart = element;
            if(element.length === 1) {
                newPart = `${element}0`;
            }
            versionCode = `${versionCode}${newPart}`;
        });

        console.log(`Gradle Path : ${finalNewVersion}`);
        console.log(`Version Name : ${versionCode}`);

        fs.readFile(gradlePath, 'utf8', function (err, data) {
            if(!data) return
            
            newGradle = data;
            if (versionCode.length > 0)
                newGradle = newGradle.replace(versionCodeRegexPattern, `$1${versionCode}`);
            if (versionName.length > 0)
                newGradle = newGradle.replace(versionNameRegexPattern, `$1\"${finalNewVersion}\"`);
            fs.writeFile(gradlePath, newGradle, function (err) {
                if (err) throw err;
                if (versionCode.length > 0)
                    console.log(`Successfully override version code ${versionCode}`)
                    console.log(`Version Name JJA : ${versionCode}`);
                if (versionName.length > 0)
                    console.log(`Successfully override version code ${versionName}`)
                console.log(`Version Name JJA : ${versionName}`);
                core.setOutput("result", `Done`);
            });
        });
    }
} catch (error) {
    core.setFailed(error.message);
}
