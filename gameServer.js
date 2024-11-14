const nodemon = require('nodemon');
const cluster = require('cluster');
const { fork } = require('child_process');
const puppeteer = require('puppeteer');

// console.log(process)

if (cluster.isMaster) {
    let browser, page, wsEndpoint; // This will hold the Puppeteer browser instance
    // Launch the browser when the master starts
    async function launchBrowser(url) {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--remote-debugging-port=9222']
        })
        page = await browser.newPage();
    
        wsEndpoint = browser.wsEndpoint();
    
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        // await page.waitForNavigation()

        // Fork child processes
        // const child = fork('./game.js', { data: wsEndpoint});
        // child.send({ message: 'page data', data: wsEndpoint})
        
        nodemon.on('restart', () => {
            console.log('Restarting child process...');
            child.kill(); // Kill the current child process
            const newChild = fork('./game.js'); // Fork a new child process
            newChild.send({ message: 'page data', data: wsEndpoint})
            //set up additional IPC here if needed'
            // nodemon({ script: './game.js' });

        });

        return new Promise((resolve) => {
            // Restart the child process on file changes
            const nodemon = require('nodemon');
            nodemon({ script: './game.js', env: { WSE: wsEndpoint } });
            resolve()
        })

    }

    launchBrowser('https://lights.devfestlagos.com')

    process.on('exit', async () => {
        if (browser) {
            await browser.close(); // Close the browser when the master exits
        }
    });

} else {
    // code will run in the child process
    // require('./game.js');
}
