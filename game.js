
// const { initialize } = require('passport');
const puppeteer = require('puppeteer')
const wsEndpoint = process.env.WSE;

async function getPage(){
    
    let connectedBrowser;
    try{
        connectedBrowser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });    
        const pages = await connectedBrowser.pages();
        const page = pages.filter((page) => page.url().includes('lights.devfestlagos.com'))[0];
        console.log('CONNECTION SUCCESSFUL: WebSocket Debugger URL:', wsEndpoint);
        return page;
    }catch (err) {
        console.log("Error connecting to browser instance", err.message)
        return;
    }
    // await page.waitForNavigation()
}


async function clickSequence(page){
    let gameSequence = await page.evaluate(() => gameSequence);
    console.log('clickSeq > gameSequence', gameSequence)

    for ( let i = 0; i < gameSequence.length; i++){

        try {
            const button = await page.$(`div[data-token="${gameSequence[i]}"]`);
            if (button) {
                await button.click();
                await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 100)));
                // await button.waitForSelector(`active`)
                // await page.click(`div[data-token="${gameSequence[i]}"]`, { delay: 300, clickCount: 1})
                console.log('cliked sequence...', gameSequence[i])
            } else {
                console.error(`Button not found for element ${gameSequence[i]}`);
            }
        } catch (error) {
            console.log('Error clicking the element:', error.message);
        }

    }

}

async function playGame(page, clrInt){
    // const isPlayed = await page.evaluate(() => isPlaying)
    // console.log("isPlaying", isPlayed)

    console.log("Game strarting.....")
    // await page.waitForNavigation()
    
    // page.reload()
    // await page.waitForNavigation()

    if(page?.url() === 'https://lights.devfestlagos.com/'){
        console.log('You\'re currently logged out or not playing the game');
        return;
    }

}

(async function initialize(){
    const page = await getPage();

    // Listen for navigation events in the main frame and all child frames
    page?.on('framenavigated', async (frame) => {
        if (frame === page.mainFrame()) { 
            console.log('User navigated to:', frame.url());
            if( frame.url() === 'https://lights.devfestlagos.com/game' ){
                // await mainFrameVars(mainFrame)
                await playGame(page)
                // 
                page.waitForSelector('div.controls') //{ timeout: 0}

                const controls = await page.$$eval('div.controls', (El) => El.map(E => {

                    let startBtn = E.querySelector('button#start-game');
                    let leaderboardBtn = E.querySelector('a[href="/leaderboard"]')
                    // leaderboardBtn.answer = answer
                    function answer(){
                        leaderboardBtn.textContent = "Answer";
                        leaderboardBtn.setAttribute('href', '#');
            
                        console.log('listeneer > answer button and variables prepared..', window.vars)
                    }

                    startBtn.removeEventListener('click', answer )

                    startBtn.addEventListener('click', answer)

                    // leaderboardBtn.addEventListener('click', window.answer)
            
                    return [startBtn.textContent, leaderboardBtn.textContent]
                }))
                console.log('controls > navigation > game', controls)
            }
            if( frame.url() === 'https://lights.devfestlagos.com/game#'){
                await clickSequence(page)
            }

        }
    });

    // async function addEvents(page) {
    //     page.waitForSelector('div.controls') //{ timeout: 0}
    // }

    const controls = await page.$$eval('div.controls', (El) => El.map(E => {

        let startBtn = E.querySelector('button#start-game');
        let leaderboardBtn = E.querySelector('a[href="/leaderboard"]')
        // leaderboardBtn.answer = answer

        startBtn.addEventListener('click', function (){
            leaderboardBtn.textContent = "Answer";
            leaderboardBtn.setAttribute('href', '#');

            console.log('listeneer > answer button and variables prepared..', window.vars)
        })
        // leaderboardBtn.addEventListener('click', window.answer)

        return [startBtn.textContent, leaderboardBtn.textContent]
    }))
    console.log('controls > baseEvent', controls)

    // console.log(page)
})()

//     if(page.url() === 'https://lights.devfestlagos.com/game' || page.url() === 'https://lights.devfestlagos.com/game#'){
//         mainFrameVars = await mainFrame.evaluate(() => {
//             return {
//                 isPlaying,
//                 gameSequence,
//                 playerSequence,
//                 gameTimer,
//                 isGameInProgress,
//                 currentLevel,
//                 colorTokens,
//                 level
//             }
//         });
//     }