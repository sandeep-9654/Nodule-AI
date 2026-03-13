const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    // 16:9 ratio, 4K resolution for super crisp PDF export
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1440, deviceScaleFactor: 2 });
    
    // Utility to take screenshots
    const take = async (name) => {
        await page.screenshot({ path: path.join(__dirname, `${name}.png`) });
        console.log(`Saved ${name}.png`);
    };

    try {
        // 1. Dashboard
        console.log('Navigating to dashboard...');
        await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await take('slide_10_11_dashboard');

        // 2. Info page
        console.log('Navigating to info...');
        await page.goto('http://localhost:3000/info', { waitUntil: 'networkidle0' });
        await take('slide_16_info');

        // 3. Performance
        console.log('Navigating to performance...');
        await page.goto('http://localhost:3000/performance', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        await take('slide_15_performance');

        // 4. Analyze Dropzone
        console.log('Navigating to analyze...');
        await page.goto('http://localhost:3000/analyze', { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1000));
        await take('slide_12_analyze');

        // 5. Upload File & Wait for 3D Visualizer
        console.log('Uploading malignant file...');
        const fileInput = await page.$('input[type=file]');
        if (fileInput) {
            const filePath = '/Users/sandeepraghavendra/Desktop/project/data/Dataset/test_samples/sample_01_malignant.npy';
            await fileInput.uploadFile(filePath);
            
            // Wait for 3D viewer to render (let's give it 12 seconds to ensure inference and WebGL is done)
            console.log('Waiting for inference and WebGL rendering...');
            await new Promise(r => setTimeout(r, 12000));
            
            // Re-take screenshot of the filled page
            await take('slide_13_14_visualizer');
        } else {
            console.error('Could not find file input on /analyze');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
        console.log('Done!');
    }
})();
